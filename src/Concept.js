import BaseEntity from "./BaseEntity";
import ResourceUtil from "./utility/ResourceUtil";
import General from "./utility/General";
import _ from "lodash";
import MultipleCodedValues from "./observation/MultipleCodedValues";
import SingleCodedValue from "./observation/SingleCodedValue";
import PrimitiveValue from "./observation/PrimitiveValue";
import Duration from "./Duration";
import CompositeDuration from "./CompositeDuration";
import KeyValue from "./application/KeyValue";
import PhoneNumber from "./PhoneNumber";
import Identifier from "./Identifier";
import QuestionGroup from "./observation/QuestionGroup";
import RepeatableQuestionGroup from "./observation/RepeatableQuestionGroup";

export class ConceptAnswer {
  static schema = {
    name: "ConceptAnswer",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      concept: "Concept",
      answerOrder: "double",
      abnormal: "bool",
      unique: "bool",
      voided: {type: "bool", default: false},
    },
  };

  get name() {
    return this.concept.name;
  }

  static fromResource(resource, entityService) {
    const conceptAnswer = new ConceptAnswer();
    conceptAnswer.concept = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "conceptAnswerUUID"),
      Concept.schema.name
    );
    conceptAnswer.uuid = resource.uuid;
    conceptAnswer.answerOrder = resource.order;
    conceptAnswer.abnormal = resource.abnormal;
    conceptAnswer.unique = resource.unique;
    conceptAnswer.voided = resource.voided || false; //This change should be independently deployable irrespective of server
    return conceptAnswer;
  }

  static parentAssociations = () => new Map([[Concept, "conceptUUID"]]);
}

export default class Concept {
  static StandardConcepts = {
    OtherConceptUUID: "05ea583c-51d2-412d-ad00-06c432ffe538",
    NoneConceptUUID: "ebda5e05-a995-43ca-ad1a-30af3b937539",
  };

  static schema = {
    name: "Concept",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      name: "string",
      datatype: "string",
      answers: {type: "list", objectType: "ConceptAnswer"},
      lowAbsolute: {type: "double", optional: true},
      hiAbsolute: {type: "double", optional: true},
      lowNormal: {type: "double", optional: true},
      hiNormal: {type: "double", optional: true},
      unit: {type: "string", optional: true},
      keyValues: {type: "list", objectType: "KeyValue"},
      voided: {type: "bool", default: false},
    },
  };

  static dataType = {
    Date: "Date",
    DateTime: "DateTime",
    Time: "Time",
    Duration: "Duration",
    Coded: "Coded",
    Numeric: "Numeric",
    Boolean: "Boolean",
    Text: "Text",
    Notes: "Notes",
    NA: "NA",
    Image: "Image",
    Video: "Video",
    Audio: "Audio",
    Id: "Id",
    Location: "Location",
    Subject: "Subject",
    PhoneNumber: "PhoneNumber",
    GroupAffiliation: "GroupAffiliation",
    QuestionGroup: "QuestionGroup",
    File: "File",
    Encounter: "Encounter",
    get Media() {
      return [this.Image, this.Video, this.Audio, this.File];
    },
  };

  static keys = {
    isWithinCatchment: 'isWithinCatchment',
    lowestAddressLevelTypeUUIDs: 'lowestAddressLevelTypeUUIDs',
    highestAddressLevelTypeUUID: 'highestAddressLevelTypeUUID',
    subjectTypeUUID: 'subjectTypeUUID',
    encounterTypeUUID: 'encounterTypeUUID',
    encounterScope: 'encounterScope',
    encounterIdentifier: 'encounterIdentifier'
  };

  static encounterScopes = {
    withinSubject: 'Within Subject',
  };

  // static primitiveDataTypes = [Concept.dataType.Boolean, Concept.dataType.Coded, Concept.dataType.Numeric, Concept.dataType.Date, Concept.dataType.Text];

  static fromResource(conceptResource, entityService) {
    const concept = new Concept();
    concept.name = conceptResource.name;
    concept.uuid = conceptResource.uuid;
    concept.datatype = conceptResource.dataType;
    concept.lowAbsolute = conceptResource.lowAbsolute;
    concept.hiAbsolute = conceptResource.highAbsolute;
    concept.lowNormal = conceptResource.lowNormal;
    concept.hiNormal = conceptResource.highNormal;
    concept.unit = conceptResource.unit;
    concept.voided = conceptResource.voided || false; //This change should be independently deployable irrespective of server
    //remove orphan keyValues (because KeyValue doesn't have primary key
    entityService &&
    entityService.deleteObjects(conceptResource["uuid"], Concept.schema.name, "keyValues");
    concept.keyValues = _.map(conceptResource.keyValues, KeyValue.fromResource);
    return concept;
  }

  static childAssociations = () => new Map([[ConceptAnswer, "answers"]]);

  static associateChild(child, childEntityClass, childResource, entityService) {
    let concept = BaseEntity.getParentEntity(
      entityService,
      childEntityClass,
      childResource,
      "conceptUUID",
      Concept.schema.name
    );
    concept = General.pick(concept, ["uuid"], ["answers"]);
    let newAnswers = concept.answers;
    if (childEntityClass !== ConceptAnswer) {
      throw `${childEntityClass.name} not support by ${Concept.name}`;
    }

    BaseEntity.addNewChild(child, newAnswers);

    concept.answers = newAnswers;
    return concept;
  }

  static merge = () => BaseEntity.mergeOn("answers");

  static create(name, dataType, keyValues, uuid = General.randomUUID()) {
    const concept = new Concept();
    concept.name = name;
    concept.datatype = dataType;
    concept.uuid = uuid;
    concept.keyValues = keyValues;
    return concept;
  }

  cloneForReference() {
    const concept = Concept.create(this.name, this.datatype, this.keyValues);
    concept.uuid = this.uuid;
    concept.unit = this.unit;
    concept.lowAbsolute = this.lowAbsolute;
    concept.lowNormal = this.lowNormal;
    concept.hiNormal = this.hiNormal;
    concept.hiAbsolute = this.hiAbsolute;
    concept.answers = this.answers || [];
    return concept;
  }

  _valuePresent(value) {
    return !_.isNil(value) && !isNaN(value);
  }

  violatesRange(value) {
    return this.isAboveHiAbsolute(value) || this.isBelowLowAbsolute(value);
  }

  isAbnormal(value) {
    let valueWrapper = this.getValueWrapperFor(value);
    switch (this.datatype) {
      case Concept.dataType.Numeric:
        return (
          this.isBelowLowNormal(valueWrapper.answer) || this.isAboveHiNormal(valueWrapper.answer)
        );
      case Concept.dataType.Coded:
        return valueWrapper.hasAnyAbnormalAnswer(this.abnormalAnswers());
      default:
        return false;
    }
  }

  abnormalAnswers() {
    return _.filter(this.answers, (conceptAnswer) => conceptAnswer.abnormal).map(
      (conceptAnswer) => {
        return conceptAnswer.concept.uuid;
      }
    );
  }

  isBelowLowNormal(value) {
    return this._areValidNumbers(value, this.lowNormal) && value < this.lowNormal;
  }

  isAboveHiNormal(value) {
    return this._areValidNumbers(value, this.hiNormal) && value > this.hiNormal;
  }

  isBelowLowAbsolute(value) {
    return this._areValidNumbers(value, this.lowAbsolute) && value < this.lowAbsolute;
  }

  isAboveHiAbsolute(value) {
    return this._areValidNumbers(value, this.hiAbsolute) && value > this.hiAbsolute;
  }

  addAnswer(concept) {
    const conceptAnswer = new ConceptAnswer();
    conceptAnswer.uuid = General.randomUUID();
    conceptAnswer.concept = concept;
    this.answers.push(conceptAnswer);
    return conceptAnswer;
  }

  getPossibleAnswerConcept(nameOrUuid) {
    return _.find(this.answers, (conceptAnswer) => conceptAnswer.concept.name === nameOrUuid || conceptAnswer.concept.uuid === nameOrUuid);
  }

  getValueWrapperFor(obsValue) {
    if (this.isSelectConcept()) {
      return _.isArray(obsValue)
          ? new MultipleCodedValues(obsValue)
          : new SingleCodedValue(obsValue);
    }
    if (this.isDurationConcept()) {
      return CompositeDuration.fromObs(obsValue);
    }
    if (this.isPhoneNumberConcept()) {
        return PhoneNumber.fromObs(obsValue);
    }
    if (this.isIdConcept()) {
      return Identifier.fromObs(obsValue);
    }
    if (this.isQuestionGroup()) {
      return 'repeatableObservations' in obsValue
          ? RepeatableQuestionGroup.fromObs(obsValue)
          : QuestionGroup.fromObs(obsValue)
    }
    return new PrimitiveValue(obsValue, this.datatype);
  }

  isType(type) {
    return this.datatype === type;
  }

  isCodedConcept() {
    return this.isType(Concept.dataType.Coded);
  }

  isSubjectConcept() {
    return this.isType(Concept.dataType.Subject);
  }

  isEncounterConcept() {
    return this.isType(Concept.dataType.Encounter);
  }

  isMediaConcept() {
    return _.includes([Concept.dataType.Image, Concept.dataType.Video, Concept.dataType.File], this.datatype);
  }

  isSelectConcept() {
    return this.isCodedConcept() || this.isSubjectConcept() || this.isEncounterConcept() || this.isMediaConcept();
  }

  isDurationConcept() {
    return this.isType(Concept.dataType.Duration);
  }

  isPhoneNumberConcept() {
    return this.isType(Concept.dataType.PhoneNumber);
  }

  isIdConcept() {
    return this.isType(Concept.dataType.Id);
  }

  isQuestionGroup() {
    return this.isType(Concept.dataType.QuestionGroup);
  }

  isPrimitive() {
    return [
      Concept.dataType.Text,
      Concept.dataType.Time,
      Concept.dataType.Numeric,
      Concept.dataType.Audio,
      Concept.dataType.Date,
      Concept.dataType.DateTime,
      Concept.dataType.Location,
    ].includes(this.datatype)
  }

  getAnswers() {
    return _.sortBy(this.answers, (answer) => {
      return _.indexOf(
        [Concept.StandardConcepts.OtherConceptUUID, Concept.StandardConcepts.NoneConceptUUID],
        answer.concept.uuid
      ) !== -1
        ? 99999
        : answer.answerOrder;
    }).filter((ans) => !ans.voided);
  }

  getAnswerWithConceptName(answerName) {
    return _.find(this.getAnswers(), answer =>  answer.concept.name === answerName);
  }

  getAnswerWithConceptUuid(answerConceptUuid) {
    return _.find(this.getAnswers(), answer =>  answer.concept.uuid === answerConceptUuid);
  }

  get translatedFieldValue() {
    return this.name;
  }

  _areValidNumbers(...numbers) {
    return _.every(numbers, (value) => value !== null && _.isFinite(value));
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

  isMobileNo() {
    const keyValue = this.recordValueByKey(KeyValue.PrimaryContactKey) || this.recordValueByKey(KeyValue.ContactNumberKey);
    return (keyValue === KeyValue.ContactYesValue);
  }
}
