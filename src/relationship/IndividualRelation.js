import ReferenceEntity from "../ReferenceEntity";
import SchemaNames from "../SchemaNames";

class IndividualRelation extends ReferenceEntity {
  static schema = {
    name: SchemaNames.IndividualRelation,
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      name: "string",
      voided: { type: "bool", default: false },
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

  static createEmptyInstance() {
    return new IndividualRelation();
  }

  clone() {
    const individualRelation = super.clone(new IndividualRelation());
    individualRelation.voided = this.voided;
    return individualRelation;
  }

  static fromResource(resource) {
    let individualRelation = ReferenceEntity.fromResource(resource, new IndividualRelation());
    //TODO when voided is introduced on ReferenceEntity, this can move there.
    individualRelation.voided = resource.voided;
    return individualRelation;
  }
}

export default IndividualRelation;
