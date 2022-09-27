import BaseEntity from "./BaseEntity";
import ResourceUtil from "./utility/ResourceUtil";
import Concept from "./Concept";

export default class ConceptAnswer extends BaseEntity {
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

  constructor(that = null) {
    super(that);
  }

  get abnormal() {
    return this.that.abnormal;
  }

  set abnormal(x) {
    this.that.abnormal = x;
  }

  get answerOrder() {
    return this.that.answerOrder;
  }

  set answerOrder(x) {
    this.that.answerOrder = x;
  }

  get unique() {
    return this.that.unique;
  }

  set unique(x) {
    this.that.unique = x;
  }

  get concept() {
    return this.toEntity("concept", Concept);
  }

  set concept(x) {
    this.that.concept = this.fromObject(x);
  }

  get name() {
    return this.that.name;
  }

  set name(x) {
    this.that.name = x;
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
