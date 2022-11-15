import ResourceUtil from "../utility/ResourceUtil";
import FormElementGroup from "./FormElementGroup";
import Concept from "../Concept";
import General from "../utility/General";
import _ from "lodash";
import ValidationResult from "./ValidationResult";
import KeyValue from "./KeyValue";
import Format from "./Format";
import moment from "moment";
import Documentation from "../Documentation";
import BaseEntity from "../BaseEntity";
import SchemaNames from "../SchemaNames";

class FormElement extends BaseEntity {
  static schema = {
    name: SchemaNames.FormElement,
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      name: "string",
      displayOrder: "double",
      mandatory: "bool",
      keyValues: { type: "list", objectType: "KeyValue" },
      concept: "Concept",
      type: { type: "string", optional: true },
      formElementGroup: "FormElementGroup",
      validFormat: { type: "Format", optional: true },
      voided: { type: "bool", default: false },
      rule: { type: "string", optional: true },
      groupUuid: { type: "string", optional: true },
      documentation: { type: "Documentation", optional: true },
    },
  };

   constructor(that = null) {
    super(that);
  }

  get name() {
      return this.that.name;
  }

  set name(x) {
      this.that.name = x;
  }

  get displayOrder() {
      return this.that.displayOrder;
  }

  set displayOrder(x) {
      this.that.displayOrder = x;
  }

  get mandatory() {
      return this.that.mandatory;
  }

  set mandatory(x) {
      this.that.mandatory = x;
  }

  get keyValues() {
      return this.toEntityList("keyValues", KeyValue);
  }

  set keyValues(x) {
      this.that.keyValues = this.fromEntityList(x);
  }

  get concept() {
      return this.toEntity("concept", Concept);
  }

  set concept(x) {
      this.that.concept = this.fromObject(x);
  }

  get type() {
      return this.that.type;
  }

  set type(x) {
      this.that.type = x;
  }

  get formElementGroup() {
      return this.toEntity("formElementGroup", FormElementGroup);
  }

  set formElementGroup(x) {
      this.that.formElementGroup = this.fromObject(x);
  }

  get validFormat() {
      return this.toEntity("validFormat", Format);
  }

  set validFormat(x) {
      this.that.validFormat = this.fromObject(x);
  }

  get rule() {
      return this.that.rule;
  }

  set rule(x) {
      this.that.rule = x;
  }

  get groupUuid() {
      return this.that.groupUuid;
  }

  set groupUuid(x) {
      this.that.groupUuid = x;
  }

  get documentation() {
      return this.toEntity("documentation", Documentation);
  }

  set documentation(x) {
      this.that.documentation = this.fromObject(x);
  }

  static parentAssociations = () => new Map([[FormElementGroup, "formElementGroupUUID"]]);

  static fromResource(resource, entityService) {
    const formElementGroup = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "formElementGroupUUID"),
      FormElementGroup.schema.name
    );
    const concept = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "conceptUUID"),
      Concept.schema.name
    );

    const formElement = General.assignFields(
      resource,
      new FormElement(),
      ["uuid", "name", "displayOrder", "mandatory", "type", "voided", "rule"],
      []
    );
    formElement.formElementGroup = formElementGroup;
    formElement.groupUuid = ResourceUtil.getUUIDFor(resource, "groupQuestionUUID");
    formElement.documentation = entityService.findByKey(
        "uuid",
        ResourceUtil.getUUIDFor(resource, "documentationUUID"),
        Documentation.schema.name
    );
    formElement.concept = concept;

    //remove orphan keyValues (because KeyValue doesn't have primary key
    entityService.deleteObjects(resource["uuid"], FormElement.schema.name, "keyValues");
    formElement.keyValues = _.map(resource.keyValues, KeyValue.fromResource);
    formElement.validFormat = Format.fromResource(resource["validFormat"]);
    return formElement;
  }

  getType() {
    return this.concept.datatype === Concept.dataType.Coded ? this.type : this.concept.datatype;
  }

  isMultiSelect() {
    return this.type === "MultiSelect";
  }

  excludedAnswers() {
    const selectRecord = this.recordByKey(FormElement.keys.ExcludedAnswers);
    return _.isNil(selectRecord) ? [] : selectRecord.getValue();
  }

  set answersToSkip(answersToExclude) {
    this.answersToExclude = answersToExclude;
  }

  set setAnswersToShow(answersToShow) {
    this.answersToShow = answersToShow;
  }

  recordByKey(key) {
    return _.find(this.keyValues, (keyValue) => keyValue.key === key);
  }

  recordValueByKey(key) {
    return _.invoke(
      _.find(this.keyValues, (it) => it.key === key),
      "getValue"
    );
  }

  isSingleSelect() {
    return this.type === "SingleSelect" || _.isNil(this.type);
  }

  get truthDisplayValue() {
    const trueRecord = this.recordByKey(FormElement.keys.TrueValue);
    return _.isNil(trueRecord) ? "yes" : trueRecord.getValue();
  }

  get falseDisplayValue() {
    const falseRecord = this.recordByKey(FormElement.keys.FalseValue);
    return _.isNil(falseRecord) ? "no" : falseRecord.getValue();
  }

  validate(value) {
    const failure = new ValidationResult(false, this.uuid);
    if (this.mandatory && _.isEmpty(_.toString(value)) && this.concept.datatype !== Concept.dataType.GroupAffiliation) {
      failure.messageKey = "emptyValidationMessage";
    } else if (this.concept.datatype === Concept.dataType.Numeric && isNaN(value)) {
      failure.messageKey = "numericValueValidation";
    } else if (this.concept.isBelowLowAbsolute(value)) {
      failure.messageKey = "numberBelowLowAbsolute";
      failure.extra = { limit: this.concept.lowAbsolute };
    } else if (this.concept.isAboveHiAbsolute(value)) {
      failure.messageKey = "numberAboveHiAbsolute";
      failure.extra = { limit: this.concept.hiAbsolute };
    } else if (
      !_.isEmpty(this.validFormat) &&
      !_.isEmpty(_.toString(value)) &&
      !this.validFormat.valid(value)
    ) {
      failure.messageKey = this.validFormat.descriptionKey;
    } else if (this.isMultiSelect() && !_.isEmpty(value)) {
      return this._validateMultiSelect(value);
    } else if (this.concept.datatype === Concept.dataType.DateTime &&
      ((!this.mandatory && !_.isNil(value)) || (this.mandatory))) {
      if (!moment(value).isValid()) {
        failure.messageKey = "invalidDateTimeFormat";
      } else if (General.hoursAndMinutesOfDateAreZero(value)) {
        failure.messageKey = "timeValueValidation";
      } else {
        return new ValidationResult(true, this.uuid, null);
      }
    } else if (this.concept.datatype === Concept.dataType.Time && !moment(value, 'HH:mm').isValid() &&
      ((!this.mandatory && !_.isNil(value)) || (this.mandatory))) {
      failure.messageKey = "invalidTimeFormat";

    } else if (this.concept.datatype === Concept.dataType.Date && !moment(value).isValid() &&
      ((!this.mandatory && !_.isNil(value)) || (this.mandatory))) {
      failure.messageKey = "invalidDateFormat";
    } else if (
      this.mandatory &&
      this.concept.datatype === Concept.dataType.Duration &&
      _.some(_.map(value.durations, "durationValue"), (durationValue) => _.isEmpty(durationValue))
    ) {
      failure.messageKey = "emptyValidationMessage";
    } else if (
        this.concept.datatype === Concept.dataType.PhoneNumber &&
        !_.isEmpty(value) && !(/^[0-9]{10}$/.test(value))
    ) {
      failure.messageKey = "invalidPhoneNumber";
    } else {
      return new ValidationResult(true, this.uuid, null);
    }
    return failure;
  }

  getAnswers() {
    const allAnswers = this.concept.getAnswers();
    if (!_.isEmpty(this.answersToShow)) {
      return _.filter(allAnswers, (allConceptAnswer) => _.find(this.answersToShow, (conceptAnswer => conceptAnswer === allConceptAnswer.name)));
    } else {
      const excludedAnswers = this.excludedAnswers().map((conceptName) => ({
        concept: { name: conceptName },
      }));
      return _.differenceBy(
        allAnswers,
        excludedAnswers.concat(_.isEmpty(this.answersToExclude) ? [] : this.answersToExclude),
        (a) => a.concept.name
      );
    }
  }

  getApplicableAnswerConceptUUIDs() {
    return _.map(this.getAnswers(), ca => ca.concept.uuid);
  }

  getAnswerWithConceptName(conceptName) {
    return _.find(this.concept.getAnswers(), (answer) => answer.concept.name === conceptName);
  }

  getAnswerWithConceptUuid(conceptUuid) {
    return _.find(this.concept.getAnswers(), (answer) => answer.concept.uuid === conceptUuid);
  }

  getRawAnswers() {
    return this.concept.getAnswers();
  }

  static keys = {
    Select: "Select",
    TrueValue: "TrueValue",
    FalseValue: "FalseValue",
    ExcludedAnswers: "ExcludedAnswers",
    IdSourceUUID: "IdSourceUUID",
    groupSubjectTypeUUID: "groupSubjectTypeUUID",
    groupSubjectRoleUUID: "groupSubjectRoleUUID",
    allowedTypes: "allowedTypes",
    allowedMaxSize: "allowedMaxSize",
    displayAllGroupMembers: "displayAllGroupMembers",
    searchOptions: "searchOptions",
  };

  static values = {
    Single: "Single",
    Multi: "Multi",
  };

  get translatedFieldValue() {
    return this.name;
  }

  get durationOptions() {
    const durationOptions = this.recordByKey("durationOptions");
    return _.isNil(durationOptions) ? null : durationOptions.getValue();
  }

  get editable() {
    const editable = this.recordByKey("editable");
    return _.isNil(editable) ? true : editable.getValue();
  }

  get repeatable() {
    const repeatable = this.recordByKey("repeatable");
    return _.isNil(repeatable) ? false : repeatable.getValue();
  }

  get datePickerMode() {
    const datePickerMode = this.recordByKey("datePickerMode");
    return _.isNil(datePickerMode) ? null : datePickerMode.getValue();
  }

  get timePickerMode() {
    const timePickerMode = this.recordByKey("timePickerMode");
    return _.isNil(timePickerMode) ? null : timePickerMode.getValue();
  }

  get isUnique() {
    const unique = this.recordByKey("unique");
    return _.isNil(unique) ? false : unique.getValue();
  }

  get styles() {
    const style = {};
    const backgroundColour = this.recordValueByKey("backgroundColour");
    const textColour = this.recordValueByKey("textColour");
    if (!_.isEmpty(backgroundColour)) {
      style['backgroundColor'] = backgroundColour
    }
    if (!_.isEmpty(textColour)) {
      style['color'] = textColour;
    }
    if (!_.isEmpty(style)) {
      style['paddingHorizontal'] = 5;
    }
    return style;
  }

  matches(elementNameOrUUID) {
    return this.name === elementNameOrUUID || this.uuid === elementNameOrUUID;
  }

  isQuestionGroup() {
    return !_.isNil(this.groupUuid);
  }

  toJSON() {
    return {
      uuid: this.uuid,
      name: this.name,
      displayOrder: this.displayOrder,
      mandatory: this.mandatory,
      keyValues: this.keyValues,
      concept: this.concept,
      formElementGroupUUID: this.formElementGroup.uuid,
      groupUuid: this.groupUuid,
      documentation: this.documentation,
    };
  }

  _validateMultiSelect(value) {
    const conflict = this.getUniqueAnswerConflict(this._getSelectedAnswers(value));
    if (_.isNil(conflict)) {
      return new ValidationResult(true, this.uuid, null);
    }
    return new ValidationResult(false, this.uuid, "uniqueAnswerConflict", {
      answer: conflict.concept.name,
    });
  }

  _getSelectedAnswers(value) {
    return value.isMultipleCoded ? value.getValue() : value;
  }

  getUniqueAnswerConflict(selectedUUIDs) {
    const conceptAnswers = this.getAnswers();
    const selectedConceptAnswers = _.map(selectedUUIDs, (UUID) =>
      _.find(conceptAnswers, (it) => it.concept.uuid === UUID)
    );
    const firstUniqueAnswer = _.find(selectedConceptAnswers, (conceptAnswer) =>
      _.get(conceptAnswer, "unique")
    );
    if (selectedUUIDs.length > 1 && !_.isNil(firstUniqueAnswer)) {
      return firstUniqueAnswer;
    }
  }

  get allowedTypes() {
    const allowedTypes = this.recordByKey(FormElement.keys.allowedTypes);
    return _.isNil(allowedTypes) ? [] : allowedTypes.getValue();
  }

  get allowedMaxSize() {
    const oneMBInBytes = 1000000;
    const allowedMaxSize = this.recordByKey(FormElement.keys.allowedMaxSize);
    return _.isNil(allowedMaxSize) ? oneMBInBytes : _.toNumber(allowedMaxSize.getValue()) * oneMBInBytes;
  }

  getParentFormElement() {
      return _.find(this.formElementGroup.getFormElements(), fe => fe.uuid === this.groupUuid)
  }

  clone() {
    const formElement = new FormElement();
    formElement.uuid = this.uuid;
    formElement.name = this.name;
    formElement.displayOrder = this.displayOrder;
    formElement.mandatory = this.mandatory;
    formElement.keyValues = this.keyValues;
    formElement.concept = this.concept;
    formElement.type = this.type;
    formElement.formElementGroup = this.formElementGroup;
    formElement.validFormat = this.validFormat;
    formElement.voided = this.voided;
    formElement.rule = this.rule;
    formElement.groupUuid = this.groupUuid;
    formElement.documentation = this.documentation;
    return formElement;
  }

}

export default FormElement;
