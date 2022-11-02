import ResourceUtil from "../utility/ResourceUtil";
import General from "../utility/General";
import IndividualRelation from "./IndividualRelation";
import ReferenceEntity from "../ReferenceEntity";
import SchemaNames from "../SchemaNames";

class IndividualRelationshipType extends ReferenceEntity {
  static schema = {
    name: SchemaNames.IndividualRelationshipType,
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      name: "string",
      individualAIsToBRelation: "IndividualRelation",
      individualBIsToARelation: "IndividualRelation",
      voided: { type: "bool", default: false },
    },
  };

  constructor(that) {
    super(that);
  }

  get name() {
      return this.that.name;
  }

  set name(x) {
      this.that.name = x;
  }

  get individualAIsToBRelation() {
      return this.toEntity("individualAIsToBRelation", IndividualRelation);
  }

  set individualAIsToBRelation(x) {
      this.that.individualAIsToBRelation = this.fromObject(x);
  }

  get individualBIsToARelation() {
      return this.toEntity("individualBIsToARelation", IndividualRelation);
  }

  set individualBIsToARelation(x) {
      this.that.individualBIsToARelation = this.fromObject(x);
  }

  static createEmptyInstance() {
    const individualRelationshipType = new IndividualRelationshipType();
    individualRelationshipType.individualAIsToBRelation = IndividualRelation.createEmptyInstance();
    individualRelationshipType.individualBIsToARelation = IndividualRelation.createEmptyInstance();
    return individualRelationshipType;
  }

  clone() {
    const individualRelationshipType = new IndividualRelationshipType();
    individualRelationshipType.uuid = this.uuid;
    individualRelationshipType.individualAIsToBRelation = this.individualAIsToBRelation;
    individualRelationshipType.individualBIsToARelation = this.individualBIsToARelation;
    individualRelationshipType.voided = this.voided;
    return individualRelationshipType;
  }

  static fromResource(resource, entityService) {
    const individualAIsToBRelation = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "individualAIsToBRelationUUID"),
      IndividualRelation.schema.name
    );
    const individualBIsToBRelation = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "individualBIsToBRelationUUID"),
      IndividualRelation.schema.name
    );

    const individualRelationshipType = General.assignFields(
      resource,
      new IndividualRelationshipType(),
      ["uuid", "name", "voided"]
    );
    individualRelationshipType.individualAIsToBRelation = individualAIsToBRelation;
    individualRelationshipType.individualBIsToARelation = individualBIsToBRelation;

    return individualRelationshipType;
  }

  static parentAssociations = () =>
    new Map([
      [IndividualRelation, "individualAIsToBRelationUUID"],
      [IndividualRelation, "individualBIsToBRelationUUID"],
    ]);
}

export default IndividualRelationshipType;
