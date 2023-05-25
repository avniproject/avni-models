import ReferenceEntity from "./ReferenceEntity";
import General from "./utility/General";
import _ from "lodash";

class EncounterType extends ReferenceEntity {
  static schema = {
    name: 'EncounterType',
    primaryKey: 'uuid',
    properties: {
      uuid: 'string',
      name: 'string',
      operationalEncounterTypeName: {type: 'string', optional: true},
      displayName: 'string',
      voided: {type: 'bool', default: false},
      encounterEligibilityCheckRule: {type: 'string', optional: true},
      active: {type: 'bool', default: true},
      immutable: {type: 'bool', default: false}
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

  get operationalEncounterTypeName() {
      return this.that.operationalEncounterTypeName;
  }

  set operationalEncounterTypeName(x) {
      this.that.operationalEncounterTypeName = x;
  }

  get displayName() {
      return this.that.displayName;
  }

  set displayName(x) {
      this.that.displayName = x;
  }

  get encounterEligibilityCheckRule() {
      return this.that.encounterEligibilityCheckRule;
  }

  set encounterEligibilityCheckRule(x) {
      this.that.encounterEligibilityCheckRule = x;
  }

  get active() {
      return this.that.active;
  }

  set active(x) {
      this.that.active = x;
  }

  get immutable() {
      return this.that.immutable;
  }

  set immutable(x) {
      this.that.immutable = x;
  }

  static create(name) {
    let encounterType = new EncounterType();
    encounterType.uuid = General.randomUUID();
    encounterType.name = name;
    return encounterType;
  }

  static fromResource(operationalEncounterType) {
    const encounterType = new EncounterType();
    encounterType.name = operationalEncounterType.encounterTypeName;
    encounterType.uuid = operationalEncounterType.encounterTypeUUID;
    encounterType.voided = !!operationalEncounterType.encounterTypeVoided;
    encounterType.operationalEncounterTypeName = operationalEncounterType.name;
    encounterType.displayName = _.isEmpty(encounterType.operationalEncounterTypeName) ? encounterType.name : encounterType.operationalEncounterTypeName;
    encounterType.encounterEligibilityCheckRule = operationalEncounterType.encounterEligibilityCheckRule;
    encounterType.active = operationalEncounterType.active;
    encounterType.immutable = operationalEncounterType.immutable;
    return encounterType;
  }

  clone() {
    return General.assignFields(this, super.clone(new EncounterType()), [
      "operationalEncounterTypeName",
      "displayName",
      "immutable"
    ]);
  }
}

export default EncounterType;
