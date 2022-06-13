import _, {isNil} from "lodash";
import Observation from "./Observation";
import PrimitiveValue from "./observation/PrimitiveValue";
import SingleCodedValue from "./observation/SingleCodedValue";
import MultipleCodedValues from "./observation/MultipleCodedValues";
import Concept from "./Concept";
import CompositeDuration from "./CompositeDuration";
import PhoneNumber from "./PhoneNumber";
import Identifier from "./Identifier";
import QuestionGroup from "./observation/QuestionGroup";
import General from "./utility/General";
import RepeatableQuestionGroup from "./observation/RepeatableQuestionGroup";

class ObservationsHolder {
  constructor(observations) {
    this.observations = observations;
  }

  findObservation(concept) {
    return _.find(this.observations, (observation) => {
      return observation.concept.uuid === concept.uuid;
    });
  }

  getObservation(concept) {
    return this.findObservation(concept);
  }

  findObservationByValue(value) {
    return _.find(this.observations, (observation) => observation.getValue() === value);
  }

  updateObs(formElement, value) {
    const currentValue = this.getObservation(formElement.concept);
    _.remove(this.observations, (obs) => obs.concept.uuid === formElement.concept.uuid);

    if (formElement.concept.isPrimitive() && isNil(formElement.durationOptions)) {
      this.addOrUpdatePrimitiveObs(formElement.concept, value);
    }

    if (formElement.getType() === Concept.dataType.Id) {
      if (!_.isEmpty(value)) {
        this.observations.push(Observation.create(formElement.concept, Identifier.fromObs({...currentValue, value})));
      }
    }

    if (formElement.isSingleSelect()) {
      if (!_.isEmpty(value)) {
        const observation = Observation.create(formElement.concept, new SingleCodedValue(value));
        this.observations.push(observation);
      }
    }
    if (formElement.isMultiSelect()) {
      if (!_.isEmpty(value)) {
        const observation = Observation.create(formElement.concept, new MultipleCodedValues(value));
        this.observations.push(observation);
      }
    }
    if (
      formElement.getType() === Concept.dataType.Duration &&
      !isNil(formElement.durationOptions)
    ) {
      if (!_.isEmpty(value) && !_.isEmpty(value.durations)) {
        const observation = Observation.create(
          formElement.concept,
          CompositeDuration.fromObs(value)
        );
        this.observations.push(observation);
      }
    }
    if (formElement.getType() === Concept.dataType.PhoneNumber) {
      const observation = Observation.create(formElement.concept, PhoneNumber.fromObs(value));
      this.observations.push(observation);
    }
  }

  addOrUpdatePrimitiveObs(concept, value) {
    let currentObservation = this.findObservation(concept);
    const currentValue = currentObservation && currentObservation.getValueWrapper() || {};
    this._removeExistingObs(concept);
    if (!_.isEmpty(_.toString(value))) {
      if (concept.isIdConcept()) {
        this.observations.push(Observation.create(concept, Identifier.fromObs({...currentValue, value})));
      } else {
        this.observations.push(
          Observation.create(concept, new PrimitiveValue(value, concept.datatype))
        );
      }
    }
  }

  _removeExistingObs(concept) {
    const observation = this.getObservation(concept);
    if (!_.isEmpty(observation)) {
      _.remove(this.observations, (obs) => obs.concept.uuid === observation.concept.uuid);
    }
  }

  addOrUpdateCodedObs(concept, value, isSingleSelect) {
    this._removeExistingObs(concept);
    const getConceptUUID = (conceptAnswer) => conceptAnswer ? conceptAnswer.concept.uuid : undefined;
    if (!_.isEmpty(value)) {
      const answerUUID = isSingleSelect
          ? getConceptUUID(concept.getAnswerWithConceptName(value))
          : value.map(v => getConceptUUID(concept.getAnswerWithConceptName(v)));
      const observation = Observation.create(concept, isSingleSelect ? new SingleCodedValue(answerUUID) : new MultipleCodedValues(answerUUID));
      this.observations.push(observation);
    }
  }

  removeNonApplicableObs(allFormElements, applicableFormElements) {
    const formElementsIncludingRepeatableElements = [];
    _.forEach(allFormElements, fe => {
      if (fe.concept.isQuestionGroup()) {
        const observations = this.findObservation(fe.concept);
        const questionGroupObs = observations && observations.getValueWrapper();
        const size = questionGroupObs ? questionGroupObs.size() : 1;
        const childFormElements = _.filter(allFormElements, ({groupUuid}) => groupUuid === fe.uuid);
        _.forEach(childFormElements, cfe => {
          _.range(size).forEach(questionGroupIndex => {
            const newFormElement = cfe.clone();
            newFormElement.questionGroupIndex = _.isEmpty(cfe.rule) ? undefined : questionGroupIndex;
            formElementsIncludingRepeatableElements.push(newFormElement);
          })
        })
      } else if(_.isNil(fe.groupUuid)) {
        formElementsIncludingRepeatableElements.push(fe);
      }
    });
    const inApplicableFormElements = _.differenceWith(
        formElementsIncludingRepeatableElements,
        applicableFormElements,
        (a, b) => a.uuid === b.uuid && a.questionGroupIndex === b.questionGroupIndex
    );
    applicableFormElements.forEach((fe) => {
      if (fe.concept.isCodedConcept() && (!_.isEmpty(fe.answersToShow) || !_.isEmpty(fe.answersToExclude))) {
        fe.isQuestionGroup() ?
            this.removeNonApplicableAnswersFromQuestionGroup(fe, fe.isSingleSelect(), allFormElements) :
            this.removeNonApplicableAnswers(fe, fe.isSingleSelect(), this.getObservation(fe.concept));
      }
    });
    return _.flatten(inApplicableFormElements.map(fe => this._removeObs(fe))).filter(obs => !_.isEmpty(obs));
  }

  removeNonApplicableAnswersFromQuestionGroup(fe, isSingleSelect, allFormElements) {
    const questionGroup = this.getQuestionGroups(fe);
    const questionGroupObservation = questionGroup && questionGroup.getGroupObservationAtIndex(fe.questionGroupIndex);
    const observation = questionGroupObservation && questionGroupObservation.getObservation(fe.concept);
    if (!_.isEmpty(observation)) {
      questionGroupObservation.removeExistingObs(fe.concept);
      const applicableConceptAnswerUUIDs = fe.getApplicableAnswerConceptUUIDs();
      const applicableAnswers = _.filter(_.flatten([observation.getValue()]), value => _.includes(applicableConceptAnswerUUIDs, value));
      const newValue = isSingleSelect ? new SingleCodedValue(_.head(applicableAnswers)) : new MultipleCodedValues(applicableAnswers);
      const newObservation = Observation.create(observation.concept, newValue);
      questionGroupObservation.addObservation(newObservation);
    }
  }

  _removeObs(formElement) {
    if (formElement.isQuestionGroup()) {
      const questionGroup = this.getQuestionGroups(formElement);
      const questionGroupObservation = questionGroup && questionGroup.getGroupObservationAtIndex(formElement.questionGroupIndex);
      return questionGroupObservation && questionGroupObservation.removeExistingObs(formElement.concept);
    } else {
      return _.remove(this.observations, (obs) => obs.concept.uuid === formElement.concept.uuid)
    }
  }

  getQuestionGroups(formElement) {
    const parentFormElement = formElement.getParentFormElement();
    const questionGroupObservations = this.getObservation(parentFormElement.concept);
    return questionGroupObservations && questionGroupObservations.getValueWrapper();
  }

  removeNonApplicableAnswers(fe, isSingleSelect, observation) {
    if (!_.isEmpty(observation)) {
      _.remove(this.observations, (obs) => obs.concept.uuid === observation.concept.uuid);
      const applicableConceptAnswerUUIDs = fe.getApplicableAnswerConceptUUIDs();
      const applicableAnswers = _.filter(_.flatten([observation.getValue()]), value => _.includes(applicableConceptAnswerUUIDs, value));
      const newValue = isSingleSelect ? new SingleCodedValue(_.head(applicableAnswers)) : new MultipleCodedValues(applicableAnswers);
      const newObservation = Observation.create(observation.concept, newValue);
      this.observations.push(newObservation);
    }
  }

  updatePrimitiveCodedObs(applicableFormElements, formElementStatuses) {
    const updateQuestionGroupObs = (parentFormElement, questionGroupIndex, fe, value) => {
      parentFormElement.repeatable ? this.updateRepeatableGroupQuestion(questionGroupIndex, parentFormElement, fe, value) :
          this.updateGroupQuestion(parentFormElement, fe, value);
    };

    applicableFormElements.forEach((fe) => {
      const formElementStatus = _.find(formElementStatuses, (formElementStatus) => {
        return (fe.uuid === formElementStatus.uuid) && (_.isNil(fe.questionGroupIndex) || fe.questionGroupIndex === formElementStatus.questionGroupIndex);
      });
      const {value, questionGroupIndex} = formElementStatus;
      if (!_.isNil(value)) {
        const concept = fe.concept;
        if (fe.isQuestionGroup()) {
          const parentFormElement = _.find(applicableFormElements, ({uuid}) => fe.groupUuid === uuid);
          updateQuestionGroupObs(parentFormElement, questionGroupIndex, fe, value);
        } else if (concept.isQuestionGroup() && _.isArray(value)) {
          const observation = this.findObservation(concept);
          const questionGroup = observation && observation.getValueWrapper();
          const size = questionGroup ? questionGroup.size() : 0;
          if (size >= value.length) {
            // Don't populate the values if already done. This will allow users to edit the prepopulated values.
            // This check is added to make sure user can update the group values.
            return;
          }
          _.forEach(value, (questionGroupValue, index) => {
            if (fe.repeatable && (size < (index + 1))) {
              this.updateRepeatableGroupQuestion(index, fe, null, null, 'add');
            }
            _.forEach(questionGroupValue, (answerValue, conceptUUID) => {
              const childFormElement = _.find(fe.formElementGroup.getFormElements(), ({concept}) => concept.uuid === conceptUUID);
              if (childFormElement.concept.isCodedConcept() && childFormElement.isMultiSelect() && _.isArray(answerValue)) {
                _.forEach(answerValue, v => updateQuestionGroupObs(fe, index, childFormElement, v))
              } else {
                updateQuestionGroupObs(fe, index, childFormElement, answerValue)
              }
            })
          })
        } else {
          concept.isCodedConcept()
              ? this.addOrUpdateCodedObs(concept, value, fe.isSingleSelect())
              : this.addOrUpdatePrimitiveObs(concept, value);
        }
      }
    });
  }

  toggleSingleSelectAnswer(concept, answerUUID) {
    return this.toggleCodedAnswer(concept, answerUUID, true);
  }

  toggleCodedAnswer(concept, answerUUID, isSingleSelect) {
    let observation = this.getObservation(concept);
    if (_.isEmpty(observation)) {
      observation = Observation.create(
        concept,
        isSingleSelect
          ? new SingleCodedValue(answerUUID)
          : new MultipleCodedValues().push(answerUUID)
      );
      this.observations.push(observation);
      return observation;
    } else {
      isSingleSelect
        ? observation.toggleSingleSelectAnswer(answerUUID)
        : observation.toggleMultiSelectAnswer(answerUUID);
      if (observation.hasNoAnswer()) {
        _.remove(this.observations, (obs) => obs.concept.uuid === observation.concept.uuid);
        return null;
      }
      return observation;
    }
  }

  updateCompositeDurationValue(concept, duration) {
    let observation = this.getObservation(concept);
    if (!_.isEmpty(observation)) {
      _.remove(this.observations, (obs) => obs.concept.uuid === observation.concept.uuid);
      if (duration.isEmpty) return null;
    }
    observation = Observation.create(concept, duration);
    this.observations.push(observation);
    return observation;
  }

  updatePhoneNumberValue(concept, phoneNumber, verified = false, skipVerification = false) {
    let observation = this.getObservation(concept);
    if (!_.isEmpty(observation)) {
      _.remove(this.observations, (obs) => obs.concept.uuid === observation.concept.uuid);
      if (_.isEmpty(phoneNumber)) return null;
    }
    observation = Observation.create(concept, new PhoneNumber(phoneNumber, verified, skipVerification));
    this.observations.push(observation);
    return observation;
  }

  updateGroupQuestion(parentFormElement, childFormElement, value) {
    const parentConcept = parentFormElement.concept;
    const parentObservation = this.getObservation(parentConcept);
    const childObservations = _.isEmpty(parentObservation) ? new QuestionGroup() : parentObservation.getValueWrapper();
    this.updateChildObservations(childFormElement, childObservations, value);
    this._removeExistingObs(parentConcept);
    if (!childObservations.isEmpty()) {
      this.observations.push(Observation.create(parentConcept, childObservations));
    }
  }

  updateChildObservations(childFormElement, childObservations, value) {
    const childConcept = childFormElement.concept;
    if (childConcept.isPrimitive() && _.isNil(childFormElement.durationOptions)) {
      childObservations.removeExistingObs(childConcept);
      if (!_.isEmpty(_.toString(value))) {
        const observation = Observation.create(childConcept, new PrimitiveValue(value, childConcept.datatype));
        childObservations.addObservation(observation);
      }
    }
    if (childConcept.isCodedConcept() || childConcept.isMediaConcept()) {
      let observation = childObservations.getObservation(childConcept);
      const isSingleSelect = childFormElement.isSingleSelect();
      if (_.isEmpty(observation)) {
        observation = Observation.create(childConcept,
            isSingleSelect ? new SingleCodedValue(value) : new MultipleCodedValues().push(value));
        childObservations.addObservation(observation);
      } else {
        isSingleSelect ? observation.toggleSingleSelectAnswer(value) : observation.toggleMultiSelectAnswer(value);
        if (observation.hasNoAnswer()) {
          childObservations.removeExistingObs(childConcept);
        }
      }
    }
  }

  updateRepeatableGroupQuestion(index, parentFormElement, childFormElement, value, action) {
    const parentConcept = parentFormElement.concept;
    const observations = this.getObservation(parentConcept);
    const repeatableObservations = _.isEmpty(observations) ? new RepeatableQuestionGroup() : observations.getValueWrapper();
    if (action === RepeatableQuestionGroup.actions.add) {
      repeatableObservations.addQuestionGroup();
      return
    } else if (action === RepeatableQuestionGroup.actions.remove) {
      repeatableObservations.removeQuestionGroup(index);
      return
    }
    const childObservations = repeatableObservations.getGroupObservationAtIndex(index);
    this.updateChildObservations(childFormElement, childObservations, value);
    repeatableObservations.updateGroupObservationsAtIndex(childObservations, index);
    this._removeExistingObs(parentConcept);
    if (!repeatableObservations.isEmpty()) {
      this.observations.push(Observation.create(parentConcept, repeatableObservations));
    }
  }

  toggleMultiSelectAnswer(concept, answerUUID) {
    return this.toggleCodedAnswer(concept, answerUUID, false);
  }

  static clone(observations) {
    return _.map(observations, (o) => o.cloneForEdit());
  }

  static convertObsForSave(observations) {
    observations.forEach((observation) => {
      observation.valueJSON = JSON.stringify(observation.valueJSON);
    });
  }

  getObservationReadableValue(concept) {
    let obs = this.getObservation(concept);
    return obs ? obs.getReadableValue() : null;
  }

  addOrUpdateObservation(concept, value) {
    let observation = this.getObservation(concept);
    let valueWrapper = concept.getValueWrapperFor(value);

    if (observation) {
      observation.setValue(valueWrapper);
    }
    else {
      this.observations.push(Observation.create(concept, valueWrapper));
    }
  }

  updateObservationBasedOnValue(oldValue, newValue) {
    const observation = this.findObservationByValue(oldValue);
    if (observation) {
      observation.setValue(observation.concept.getValueWrapperFor(newValue));
    }
  }

  replaceMediaObservation(oldValue, newValue, conceptUUID) {
    if (_.isNil(conceptUUID)) {
      return this.updateObservationBasedOnValue(oldValue, newValue);
    }
    const observation = _.find(this.observations, (observation) => observation.concept.uuid === conceptUUID);
    if (observation) {
      const valueWrapper = observation.getValueWrapper();
      if (valueWrapper.isMultipleCoded) {
        const answers = valueWrapper.getValue();
        const oldValueIndex = _.indexOf(answers, oldValue);
        const newAnswers = _.reject(answers, answer => answer === oldValue);
        newAnswers.splice(oldValueIndex, 0, newValue);
        observation.valueJSON = new MultipleCodedValues(newAnswers);
      } else {
        observation.valueJSON = new SingleCodedValue(newValue);
      }
    }
  }

  migrateMultiSelectMediaObservations(form) {
    _.forEach(form.nonVoidedFormElementGroups(), feg => {
      _.forEach(feg.getFormElements(), fe => {
        const concept = fe.concept;
        const observation = this.getObservation(concept);
        if (_.includes(Concept.dataType.Media, fe.getType()) && observation && fe.isMultiSelect()) {
          const valueWrapper = observation.getValueWrapper();
          if (!_.isArray(valueWrapper.getValue())) {
            General.logDebug("ObservationHolder", `Found string value ${valueWrapper.getValue()} for multi select media element, doing migration`);
            observation.valueJSON = new MultipleCodedValues([valueWrapper.getValue()]);
          }
        }
      })
    })
  }

  toString(I18n) {
    let display = "";
    this.observations.forEach((obs) => {
      display += `${I18n.t(obs.concept.name)}: ${obs.getReadableValue()}\n`;
    });
    return display;
  }
}

export default ObservationsHolder;
