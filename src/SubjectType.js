import ReferenceEntity from "./ReferenceEntity";
import General from "./utility/General";

class SubjectType extends ReferenceEntity {
  static schema = {
    name: 'SubjectType',
    primaryKey: 'uuid',
    properties: {
      uuid: 'string',
      name: 'string',
      group: {type: 'bool', default: false},
      household: {type: 'bool', default: false},
      voided: {type: 'bool', default: false},
      active: {type: 'bool', default: true},
      type: 'string'
    }
  };
  uuid;

  static types = {
    Person: 'Person',
    Individual: 'Individual',
    Group: 'Group',
    Household: 'Household',
  };

  static create(name, group = false, household = false, type) {
    let subjectType = new SubjectType();
    subjectType.uuid = General.randomUUID();
    subjectType.name = name;
    subjectType.group = group;
    subjectType.household = household;
    subjectType.type = type;
    return subjectType;
  }

  static fromResource(operationalSubjectType) {
    const subjectType = new SubjectType();
    //assuming here that the base name is not needed. When needed we will introduce it.
    subjectType.name = operationalSubjectType.name;
    subjectType.uuid = operationalSubjectType.subjectTypeUUID;
    subjectType.voided = !!operationalSubjectType.voided;
    subjectType.group = operationalSubjectType.group;
    subjectType.household = operationalSubjectType.household;
    subjectType.active = operationalSubjectType.active;
    subjectType.type = operationalSubjectType.type;
    return subjectType;
  }

  clone() {
    const cloned = new SubjectType();
    cloned.uuid = this.uuid;
    cloned.name = this.name;
    cloned.voided = this.voided;
    cloned.group = this.group;
    cloned.household = this.household;
    cloned.active = this.active;
    cloned.type = this.type;
    return cloned;
  }

  isPerson() {
    return this.type === SubjectType.types.Person;
  }

  isIndividual() {
    return this.type === SubjectType.types.Individual;
  }

  registerIcon() {
    return this.isPerson() ? "account-plus" : "plus-box";
  }

  isGroup() {
    return this.group;
  }

  isHousehold() {
    return this.household;
  }
}

export default SubjectType;
