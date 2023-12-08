import _ from "lodash";
import Observation from "../Observation";

class SingleCodedValue {
  constructor(answerUUID, answerSource = Observation.AnswerSource.Manual) {
    this.answer = answerUUID;
    this.answerSource = answerSource;
  }

  hasValue(answerUUID) {
    return this.answer === answerUUID;
  }

  getValue() {
    return this.answer;
  }

  get toResource() {
    return this.answer;
  }

  getConceptUUID() {
    return this.answer;
  }

  cloneForEdit() {
    const singleCodedValue = new SingleCodedValue();
    singleCodedValue.answer = this.answer;
    singleCodedValue.answerSource = this.answerSource;
    return singleCodedValue;
  }

  hasAnyAbnormalAnswer(abnormalAnswerUUIDs) {
    return _.some(abnormalAnswerUUIDs, _.matches(this.answer));
  }

  get isSingleCoded() {
    return true;
  }

  get isMultipleCoded() {
    return false;
  }
}

export default SingleCodedValue;
