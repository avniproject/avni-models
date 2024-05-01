import ReferenceEntity from "./ReferenceEntity";
import General from "./utility/General";
import Format from "./application/Format";
import ResourceUtil from "./utility/ResourceUtil";
import SchemaNames from "./SchemaNames";
import _ from "lodash";

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
      validFirstNameFormat: { type: SchemaNames.Format, optional: true },
      validMiddleNameFormat: { type: SchemaNames.Format, optional: true },
      validLastNameFormat: { type: SchemaNames.Format, optional: true },
      iconFileS3Key: {type: "string", optional: true},
      syncRegistrationConcept1: {type: "string", optional: true},
      syncRegistrationConcept2: {type: "string", optional: true},
      allowProfilePicture: {type: 'bool', default: false},
      allowMiddleName: {type: 'bool', default: false},
      lastNameOptional: {type: 'bool', default: false},
      directlyAssignable: {type: 'bool', default: false},
      nameHelpText: {type: "string", optional: true},
      settings: {type: "string", default: '{}'}
    }
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

  get group() {
      return this.that.group;
  }

  set group(x) {
      this.that.group = x;
  }

  get household() {
      return this.that.household;
  }

  set household(x) {
      this.that.household = x;
  }

  get active() {
      return this.that.active;
  }

  set active(x) {
      this.that.active = x;
  }

  get type() {
      return this.that.type;
  }

  set type(x) {
      this.that.type = x;
  }

  get subjectSummaryRule() {
      return this.that.subjectSummaryRule;
  }

  set subjectSummaryRule(x) {
      this.that.subjectSummaryRule = x;
  }

  get programEligibilityCheckRule() {
      return this.that.programEligibilityCheckRule;
  }

  set programEligibilityCheckRule(x) {
      this.that.programEligibilityCheckRule = x;
  }

  get uniqueName() {
      return this.that.uniqueName;
  }

  set uniqueName(x) {
      this.that.uniqueName = x;
  }

  get validFirstNameFormat() {
      return this.toEntity("validFirstNameFormat", Format);
  }

  set validFirstNameFormat(x) {
      this.that.validFirstNameFormat = this.fromObject(x);
  }

  get validMiddleNameFormat() {
      return this.toEntity("validMiddleNameFormat", Format);
  }

  set validMiddleNameFormat(x) {
      this.that.validMiddleNameFormat = this.fromObject(x);
  }

  get validLastNameFormat() {
      return this.toEntity("validLastNameFormat", Format);
  }

  set validLastNameFormat(x) {
      this.that.validLastNameFormat = this.fromObject(x);
  }

  get iconFileS3Key() {
      return this.that.iconFileS3Key;
  }

  set iconFileS3Key(x) {
      this.that.iconFileS3Key = x;
  }

  get syncRegistrationConcept1() {
      return this.that.syncRegistrationConcept1;
  }

  set syncRegistrationConcept1(x) {
      this.that.syncRegistrationConcept1 = x;
  }

  get syncRegistrationConcept2() {
      return this.that.syncRegistrationConcept2;
  }

  set syncRegistrationConcept2(x) {
      this.that.syncRegistrationConcept2 = x;
  }

  get allowProfilePicture() {
      return this.that.allowProfilePicture;
  }

  set allowProfilePicture(x) {
      this.that.allowProfilePicture = x;
  }

  get allowMiddleName() {
      return this.that.allowMiddleName;
  }

  set allowMiddleName(x) {
      this.that.allowMiddleName = x;
  }

  get lastNameOptional() {
     return this.that.lastNameOptional;
  }

  set lastNameOptional(x) {
     this.that.lastNameOptional = x;
  }

  get nameHelpText() {
      return this.that.nameHelpText;
  }

  set nameHelpText(x) {
      this.that.nameHelpText = x;
  }

  get directlyAssignable() {
    return this.that.directlyAssignable;
  }

  set directlyAssignable(x) {
    this.that.directlyAssignable = x;
  }

  get settings() {
     return this.that.settings;
  }

  set settings(x) {
     this.that.settings = x;
  }

  static types = {
    Person: 'Person',
    Individual: 'Individual',
    Group: 'Group',
    Household: 'Household',
    User: 'User'
  };

    static settingKeys = {
        displayRegistrationDetails: 'displayRegistrationDetails',
        displayPlannedEncounters: 'displayPlannedEncounters'
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
    subjectType.lastNameOptional = operationalSubjectType.lastNameOptional;
    subjectType.directlyAssignable = operationalSubjectType.directlyAssignable;
    subjectType.allowProfilePicture = operationalSubjectType.allowProfilePicture;
    subjectType.validFirstNameFormat = Format.fromResource(operationalSubjectType["validFirstNameFormat"]);
    subjectType.validMiddleNameFormat = Format.fromResource(operationalSubjectType["validMiddleNameFormat"]);
    subjectType.validLastNameFormat = Format.fromResource(operationalSubjectType["validLastNameFormat"]);
    subjectType.iconFileS3Key = operationalSubjectType.iconFileS3Key;
    subjectType.syncRegistrationConcept1 = ResourceUtil.getUUIDFor(operationalSubjectType, 'syncRegistrationConcept1');
    subjectType.syncRegistrationConcept2 = ResourceUtil.getUUIDFor(operationalSubjectType, 'syncRegistrationConcept2');
    subjectType.nameHelpText = ResourceUtil.getUUIDFor(operationalSubjectType, 'nameHelpText');
    subjectType.settings = !_.isNil(operationalSubjectType.settings) ? JSON.stringify(operationalSubjectType.settings) : '{}';
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
    cloned.lastNameOptional = this.lastNameOptional;
    cloned.directlyAssignable = this.directlyAssignable;
    cloned.allowProfilePicture = this.allowProfilePicture;
    cloned.uniqueName = this.uniqueName;
    cloned.validFirstNameFormat = this.validFirstNameFormat;
    cloned.validMiddleNameFormat = this.validMiddleNameFormat;
    cloned.validLastNameFormat = this.validLastNameFormat;
    cloned.iconFileS3Key = this.iconFileS3Key;
    cloned.syncRegistrationConcept1 = this.syncRegistrationConcept1;
    cloned.syncRegistrationConcept2 = this.syncRegistrationConcept2;
    cloned.nameHelpText = this.nameHelpText;
    cloned.settings = this.settings;
    return cloned;
  }

  isPerson() {
    return this.type === SubjectType.types.Person;
  }

  isIndividual() {
    return this.type === SubjectType.types.Individual;
  }

  isUser() {
    return this.type === SubjectType.types.User;
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

  getSettings() {
      return JSON.parse(this.settings);
  }

  getSetting(settingName) {
      return this.getSettings()[settingName];
  }
}

export default SubjectType;
