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
    const inApplicableFormElements = _.differenceBy(
      allFormElements,
      applicableFormElements,
      (fe) => fe.uuid
    );
    applicableFormElements.forEach((fe) => {
      if (fe.concept.isCodedConcept() && (!_.isEmpty(fe.answersToShow) || !_.isEmpty(fe.answersToExclude))) {
        this.removeNonApplicableAnswers(fe, fe.isSingleSelect());
      }
    });
    return _.flatten(inApplicableFormElements.map(fe => this._removeObs(fe, allFormElements)));
  }

  _removeObs(formElement, allFormElements) {
    if (formElement.isQuestionGroup()) {
      const parentFormElement = _.find(allFormElements, ({uuid}) => formElement.groupUuid === uuid);
      const parentObservation = this.getObservation(parentFormElement.concept);
      return _.isNil(parentObservation) ? [] : parentObservation.getValueWrapper().removeExistingObs(formElement.concept);
    } else {
      return _.remove(this.observations, (obs) => obs.concept.uuid === formElement.concept.uuid)
    }
  }

  removeNonApplicableAnswers(fe, isSingleSelect) {
    const observation = this.getObservation(fe.concept);
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
    applicableFormElements.forEach((fe) => {
      let value = _.find(formElementStatuses, (formElementStatus) => {
        return fe.uuid === formElementStatus.uuid;
      }).value;
      if (!_.isNil(value)) {
        const concept = fe.concept;
        if (fe.isQuestionGroup()) {
          const parentFormElement = _.find(applicableFormElements, ({uuid}) => fe.groupUuid === uuid);
          this.updateGroupQuestion(_.get(parentFormElement, 'concept'), concept, value, fe);
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

  updateGroupQuestion(parentConcept, childConcept, value, childFormElement) {
    const parentObservation = this.getObservation(parentConcept);
    const childObservations = _.isEmpty(parentObservation) ? new QuestionGroup() : parentObservation.getValueWrapper();
    if (childConcept.isPrimitive() && _.isNil(childFormElement.durationOptions)) {
      childObservations.removeExistingObs(childConcept);
      if (!_.isEmpty(_.toString(value))) {
        const observation = Observation.create(childConcept, new PrimitiveValue(value, childConcept.datatype));
        childObservations.addObservation(observation);
      }
    }
    if (childConcept.isCodedConcept()) {
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
    this._removeExistingObs(parentConcept);
    if (!childObservations.isEmpty()) {
      this.observations.push(Observation.create(parentConcept, childObservations));
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

  toString(I18n) {
    let display = "";
    this.observations.forEach((obs) => {
      display += `${I18n.t(obs.concept.name)}: ${obs.getReadableValue()}\n`;
    });
    return display;
  }
}

export default ObservationsHolder;
