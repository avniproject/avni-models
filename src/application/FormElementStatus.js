class FormElementStatus {
  constructor(uuid, visibility, value, answersToSkip = [], validationErrors = [], answersToShow = []) {
    this.uuid = uuid;
    this.visibility = visibility;
    this.value = value;
    this.answersToSkip = answersToSkip;
    this.validationErrors = validationErrors;
    this.answersToShow = answersToShow;
  }

  _bool(formElementStatus, op) {
    const oredFormElementStatus = new FormElementStatus();
    oredFormElementStatus.uuid = this.uuid;
    oredFormElementStatus.visibility = op(this.visibility, formElementStatus.visibility);
    oredFormElementStatus.value = this.value;
    oredFormElementStatus.answersToSkip = this.answersToSkip;
    oredFormElementStatus.validationErrors = this.validationErrors;
    oredFormElementStatus.answersToShow = this.answersToShow;
    oredFormElementStatus.questionGroupIndex = this.questionGroupIndex;
    return oredFormElementStatus;
  }

  addQuestionGroupInformation(questionGroupIndex) {
    this.questionGroupIndex = questionGroupIndex;
  }

  or(formElementStatus) {
    return this._bool(formElementStatus, (a, b) => a || b);
  }

  and(formElementStatus) {
    return this._bool(formElementStatus, (a, b) => a && b);
  }
}

export default FormElementStatus;
