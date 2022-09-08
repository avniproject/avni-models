import ReferenceEntity from "./ReferenceEntity";
import General from "./utility/General";
import Format from "./application/Format";
import ResourceUtil from "./utility/ResourceUtil";

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
      type: 'string',
      subjectSummaryRule: {type: 'string', optional: true},
      programEligibilityCheckRule: {type: 'string', optional: true},
      uniqueName: {type: 'bool', default: false},
      validFirstNameFormat: { type: "Format", optional: true },
      validMiddleNameFormat: { type: "Format", optional: true },
      validLastNameFormat: { type: "Format", optional: true },
      iconFileS3Key: {type: "string", optional: true},
      syncRegistrationConcept1: {type: "string", optional: true},
      syncRegistrationConcept2: {type: "string", optional: true},
      allowProfilePicture: {type: 'bool', default: false},
      allowMiddleName: {type: 'bool', default: false},
      nameHelpText: {type: "string", optional: true},
    }
  };
  uuid;
  name;
  iconFileS3Key;
  //This property is right now used only in web-app, adding it this way for the clone().
  allowEmptyLocation;
  allowProfilePicture;
  uniqueName;
  allowMiddleName;
  validFirstNameFormat;
  validMiddleNameFormat;
  validLastNameFormat;
  programEligibilityCheckRule;

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
    subjectType.subjectSummaryRule = operationalSubjectType.subjectSummaryRule;
    subjectType.programEligibilityCheckRule = operationalSubjectType.programEligibilityCheckRule;
    subjectType.uniqueName = operationalSubjectType.uniqueName;
    subjectType.allowMiddleName = operationalSubjectType.allowMiddleName;
    subjectType.allowProfilePicture = operationalSubjectType.allowProfilePicture;
    subjectType.validFirstNameFormat = Format.fromResource(operationalSubjectType["validFirstNameFormat"]);
    subjectType.validMiddleNameFormat = Format.fromResource(operationalSubjectType["validMiddleNameFormat"]);
    subjectType.validLastNameFormat = Format.fromResource(operationalSubjectType["validLastNameFormat"]);
    subjectType.iconFileS3Key = operationalSubjectType.iconFileS3Key;
    subjectType.syncRegistrationConcept1 = ResourceUtil.getUUIDFor(operationalSubjectType, 'syncRegistrationConcept1');
    subjectType.syncRegistrationConcept2 = ResourceUtil.getUUIDFor(operationalSubjectType, 'syncRegistrationConcept2');
    subjectType.nameHelpText = ResourceUtil.getUUIDFor(operationalSubjectType, 'nameHelpText');
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
    cloned.subjectSummaryRule = this.subjectSummaryRule;
    cloned.programEligibilityCheckRule = this.programEligibilityCheckRule;
    cloned.allowEmptyLocation = this.allowEmptyLocation;
    cloned.allowMiddleName = this.allowMiddleName;
    cloned.allowProfilePicture = this.allowProfilePicture;
    cloned.uniqueName = this.uniqueName;
    cloned.validFirstNameFormat = this.validFirstNameFormat;
    cloned.validMiddleNameFormat = this.validMiddleNameFormat;
    cloned.validLastNameFormat = this.validLastNameFormat;
    cloned.iconFileS3Key = this.iconFileS3Key;
    cloned.syncRegistrationConcept1 = this.syncRegistrationConcept1;
    cloned.syncRegistrationConcept2 = this.syncRegistrationConcept2;
    cloned.nameHelpText = this.nameHelpText;
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

  isIconSetup() {
    return !_.isNil(this.iconFileS3Key);
  }

  mapNonPrimitives(realmObject, entityMapper) {
    this.validFirstNameFormat = entityMapper.toValueObject(realmObject.validFirstNameFormat, Format);
    this.validMiddleNameFormat = entityMapper.toValueObject(realmObject.validMiddleNameFormat, Format);
    this.validLastNameFormat = entityMapper.toValueObject(realmObject.validLastNameFormat, Format);
  }
}

export default SubjectType;
