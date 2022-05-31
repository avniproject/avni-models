import _ from "lodash";
import Concept from "./Concept";
import SingleCodedValue from "./observation/SingleCodedValue";
import General from "./utility/General";
import Displayable from "./Displayable";

class Observation {
  static schema = {
    name: "Observation",
    properties: {
      concept: "Concept",
      valueJSON: "string",
    },
  };

  static create(concept, value, abnormal = false) {
    const observation = new Observation();
    observation.concept = concept;
    observation.valueJSON = value;
    observation.abnormal = abnormal;
    return observation;
  }

  toggleMultiSelectAnswer(answerUUID) {
    this.getValueWrapper().toggleAnswer(answerUUID);
  }

  toggleSingleSelectAnswer(answerUUID) {
    if (this.getValueWrapper().hasValue(answerUUID)) {
      this.valueJSON = {};
    } else {
      this.valueJSON = new SingleCodedValue(answerUUID);
    }
  }

  static valueForDisplay({observation, conceptService, subjectService, addressLevelService, i18n, encounterService}) {
    const valueWrapper = observation.getValueWrapper();

    if (
      observation.concept.datatype === Concept.dataType.Date ||
      observation.concept.datatype === Concept.dataType.DateTime
    ) {
      return new Displayable(valueWrapper.asDisplayDate(), null);
    } else if (observation.concept.datatype === Concept.dataType.Time) {
      return new Displayable(valueWrapper.asDisplayTime(), null);
    } else if (valueWrapper.isSingleCoded) {
      if (observation.concept.datatype === Concept.dataType.Subject) {
        const subject = subjectService.findByUUID(valueWrapper.getValue());
        return [new Displayable(subject.nameStringWithUniqueAttribute, subject)];
      } else if (observation.concept.datatype === Concept.dataType.Encounter) {
        const encounter = encounterService.findByUUID(valueWrapper.getValue());
        const identifier = observation.concept.recordValueByKey(Concept.keys.encounterIdentifier);
        return [new Displayable(encounter.getEncounterLabel(identifier), encounter)];
      } else if (Concept.dataType.Media.includes(observation.concept.datatype)) {
        return new Displayable(valueWrapper.getValue(), null);
      } else {
        return new Displayable(i18n.t(conceptService.getConceptByUUID(valueWrapper.getConceptUUID()).name), null);
      }
    } else if (valueWrapper.isMultipleCoded) {
      if (observation.concept.datatype === Concept.dataType.Subject) {
        return valueWrapper.getValue().map(uuid => {
          const subject = subjectService.findByUUID(uuid);
          return new Displayable(subject.nameStringWithUniqueAttribute, subject);
        });
      } else if (observation.concept.datatype === Concept.dataType.Encounter) {
        const identifier = observation.concept.recordValueByKey(Concept.keys.encounterIdentifier);
        return valueWrapper.getValue().map(uuid => {
          const encounter = encounterService.findByUUID(uuid);
          return new Displayable(encounter.getEncounterLabel(identifier), encounter);
        });
      } else if (Concept.dataType.Media.includes(observation.concept.datatype)) {
        return new Displayable(valueWrapper.getValue(), null);
      } else {
        return new Displayable(_.join(
          valueWrapper.getValue().map((value) => {
            return i18n.t(conceptService.getConceptByUUID(value).name);
          }),
          ", "
        ), null);
      }
    } else if (observation.concept.isDurationConcept()) {
      return new Displayable(_.toString(valueWrapper.toString(i18n)), null);
    } else if (observation.concept.datatype === Concept.dataType.Location) {
      const addressLevel = addressLevelService.findByUUID(valueWrapper.getValue());
      return new Displayable(addressLevel.name, addressLevel);
    } else if (observation.concept.isPhoneNumberConcept()) {
      return new Displayable(_.toString(valueWrapper.toString()), null);
    } else if (observation.concept.isQuestionGroup()) {
      const groupObservations = valueWrapper.getValue();
      const groupQuestionValues = _.map(groupObservations, obs => ({[obs.concept.name] : obs.getReadableValue()}));
      return new Displayable(JSON.stringify(groupQuestionValues), null);
    } else {
      const unit = _.defaultTo(observation.concept.unit, "");
      const displayValue = unit !== "" ? _.toString(`${valueWrapper.getValue()} ${unit}`) : _.toString(`${valueWrapper.getValue()}`);
      return new Displayable(displayValue, null);
    }
  }

  isAbnormal() {
    //This is to support the old version of app where observation are being set explicitly true.
    // Developer is just being lazy here.
    if (this.abnormal === true) {
      return true;
    }
    return this.concept.isAbnormal(this.getValue());
  }

  hasNoAnswer() {
    return _.isEmpty(this.getValueWrapper().answer);
  }

  cloneForEdit() {
    const observation = new Observation();
    observation.concept = this.concept.cloneForReference();
    observation.valueJSON = this.getValueWrapper().cloneForEdit();
    return observation;
  }

  getValueWrapper() {
    if (_.isString(this.valueJSON)) {
      let valueParsed = JSON.parse(this.valueJSON);
      if (this.concept.isDurationConcept()) {
        valueParsed = valueParsed.durations;
      } else if (this.concept.isPhoneNumberConcept() || this.concept.isIdConcept() || this.concept.isQuestionGroup()) {
        return this.concept.getValueWrapperFor(valueParsed);
      } else {
        valueParsed = valueParsed.answer;
      }
      return this.concept.getValueWrapperFor(valueParsed);
    }
    return this.valueJSON;
  }

  get toResource() {
    return {
      conceptUUID: this.concept.uuid,
      value: this.getValueWrapper().toResource,
    };
  }

  getValue() {
    return this.getValueWrapper().getValue();
  }

  setValue(valueWrapper) {
    this.valueJSON = valueWrapper;
  }

  getReadableValue() {
    let value = this.getValue();
    if (!_.isNil(value)) {
      if (this.concept.isCodedConcept()) {
        switch (typeof value) {
          case "string":
            return this.concept.answers.find(
              (conceptAnswer) => conceptAnswer.concept.uuid === value
            ).name;
          case "object":
            return value.map((answerUUID) => {
              let answerConcept = this.concept.answers.find((ca) => ca.concept.uuid === answerUUID);
              if (!answerConcept) {
                let message = `Assertion error: Unable to find ${answerUUID} in coded concept ${this.concept.uuid}(${this.concept.name})`;
                General.logError("Observation.getReadableValue", message);
                throw Error(message);
              }
              return answerConcept.name;
            });
        }
      } else if(this.concept.isQuestionGroup()) {
        return _.map(value, obs => ({[obs.concept.name] : obs.getReadableValue()}))
      }
      return value;
    }
  }

  getMobileNo() {
    if (this.concept.isMobileNo()) {
      const obsValue = this.getReadableValue();
      return obsValue && obsValue.toString();
    }
  }

  isPhoneNumberVerificationRequired(filteredFormElements) {
    const formElement = _.find(filteredFormElements, fe => fe.concept.uuid === this.concept.uuid);
    return !_.isEmpty(formElement) &&
        this.concept.datatype === Concept.dataType.PhoneNumber &&
        this.concept.recordValueByKey('verifyPhoneNumber') &&
        this.getValueWrapper().isVerificationRequired()
  }
}

export default Observation;
