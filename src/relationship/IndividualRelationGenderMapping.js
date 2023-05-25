import IndividualRelation from "./IndividualRelation";
import Gender from "../Gender";
import General from "../utility/General";
import ResourceUtil from "../utility/ResourceUtil";
import BaseEntity from "../BaseEntity";
import SchemaNames from "../SchemaNames";

class IndividualRelationGenderMapping extends BaseEntity{
  static schema = {
    name: SchemaNames.IndividualRelationGenderMapping,
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      relation: "IndividualRelation",
      gender: "Gender",
      voided: { type: "bool", default: false },
    },
  };

  constructor(that = null) {
    super(that);
  }

  get relation() {
      return this.toEntity("relation", IndividualRelation);
  }

  set relation(x) {
      this.that.relation = this.fromObject(x);
  }

  get gender() {
      return this.toEntity("gender", Gender);
  }

  set gender(x) {
      this.that.gender = this.fromObject(x);
  }

  static createEmptyInstance() {
    const individualRelationGenderMapping = new IndividualRelationGenderMapping();
    return individualRelationGenderMapping;
  }

  static fromResource(resource, entityService) {
    const relation = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "relationUUID"),
      IndividualRelation.schema.name
    );
    const gender = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "genderUUID"),
      Gender.schema.name
    );

    const individualRelationGenderMapping = General.assignFields(
      resource,
      new IndividualRelationGenderMapping(),
      ["uuid", "voided"]
    );
    individualRelationGenderMapping.relation = relation;
    individualRelationGenderMapping.gender = gender;

    return individualRelationGenderMapping;
  }

}

export default IndividualRelationGenderMapping;
