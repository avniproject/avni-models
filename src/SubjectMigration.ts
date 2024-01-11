import General from "./utility/General";
import BaseEntity from "./BaseEntity";
import ResourceUtil from "./utility/ResourceUtil";
import {AuditFields, mapAuditFields} from "./utility/AuditUtil";

class SubjectMigration extends BaseEntity {
    static schema = {
        name: 'SubjectMigration',
        primaryKey: 'uuid',
        properties: {
            uuid: 'string',
            subjectUUID: 'string',
            oldAddressLevelUUID: {type: 'string', optional: true},
            newAddressLevelUUID: {type: 'string', optional: true},
            oldSyncConcept1Value: {type: 'string', optional: true},
            newSyncConcept1Value: {type: 'string', optional: true},
            oldSyncConcept2Value: {type: 'string', optional: true},
            newSyncConcept2Value: {type: 'string', optional: true},
            subjectTypeUUID: 'string',
            hasMigrated: {type: 'bool', default: false},
            ...AuditFields
        }
    };

    constructor(that = null) {
      super(that);
    }

    get subjectUUID() {
      return this.that.subjectUUID;
    }

    set subjectUUID(x) {
      this.that.subjectUUID = x;
    }

    get oldAddressLevelUUID() {
      return this.that.oldAddressLevelUUID;
    }

    set oldAddressLevelUUID(x) {
      this.that.oldAddressLevelUUID = x;
    }

    get newAddressLevelUUID() {
      return this.that.newAddressLevelUUID;
    }

    set newAddressLevelUUID(x) {
      this.that.newAddressLevelUUID = x;
    }

    get oldSyncConcept1Value() {
      return this.that.oldSyncConcept1Value;
    }

    set oldSyncConcept1Value(x) {
      this.that.oldSyncConcept1Value = x;
    }

    get newSyncConcept1Value() {
      return this.that.newSyncConcept1Value;
    }

    set newSyncConcept1Value(x) {
      this.that.newSyncConcept1Value = x;
    }

    get oldSyncConcept2Value() {
      return this.that.oldSyncConcept2Value;
    }

    set oldSyncConcept2Value(x) {
      this.that.oldSyncConcept2Value = x;
    }

    get newSyncConcept2Value() {
      return this.that.newSyncConcept2Value;
    }

    set newSyncConcept2Value(x) {
      this.that.newSyncConcept2Value = x;
    }

    get subjectTypeUUID() {
      return this.that.subjectTypeUUID;
    }

    set subjectTypeUUID(x) {
      this.that.subjectTypeUUID = x;
    }

    get hasMigrated() {
      return this.that.hasMigrated;
    }

    set hasMigrated(x) {
      this.that.hasMigrated = x;
    }

    static create(subjectUUID, oldAddressLevelUUID, newAddressLevelUUID, oldSyncConcept1Value, newSyncConcept1Value, oldSyncConcept2Value, newSyncConcept2Value, subjectTypeUUID) {
        let subjectMigration = new SubjectMigration();
        subjectMigration.uuid = General.randomUUID();
        subjectMigration.subjectUUID = subjectUUID;
        subjectMigration.oldAddressLevelUUID = oldAddressLevelUUID;
        subjectMigration.newAddressLevelUUID = newAddressLevelUUID;
        subjectMigration.oldSyncConcept1Value = oldSyncConcept1Value;
        subjectMigration.newSyncConcept1Value = newSyncConcept1Value;
        subjectMigration.oldSyncConcept2Value = oldSyncConcept2Value;
        subjectMigration.newSyncConcept2Value = newSyncConcept2Value;
        subjectMigration.subjectTypeUUID = subjectTypeUUID;
        return subjectMigration;
    }

    static fromResource(resource) {
        const subjectMigration = new SubjectMigration();
        subjectMigration.uuid = resource.uuid;
        subjectMigration.subjectUUID = ResourceUtil.getUUIDFor(resource, 'individualUUID');
        subjectMigration.oldAddressLevelUUID = ResourceUtil.getUUIDFor(resource, 'oldAddressLevelUUID');
        subjectMigration.newAddressLevelUUID = ResourceUtil.getUUIDFor(resource, 'newAddressLevelUUID');
        subjectMigration.subjectTypeUUID = ResourceUtil.getUUIDFor(resource, 'subjectTypeUUID');
        subjectMigration.oldSyncConcept1Value = resource.oldSyncConcept1Value;
        subjectMigration.newSyncConcept1Value = resource.newSyncConcept1Value;
        subjectMigration.oldSyncConcept2Value = resource.oldSyncConcept2Value;
        subjectMigration.newSyncConcept2Value = resource.newSyncConcept2Value;
        mapAuditFields(subjectMigration, resource);
        return subjectMigration;
    }

    clone() {
        const cloned = new SubjectMigration();
        cloned.uuid = this.uuid;
        cloned.subjectUUID = this.subjectUUID;
        cloned.oldAddressLevelUUID = this.oldAddressLevelUUID;
        cloned.newAddressLevelUUID = this.newAddressLevelUUID;
        cloned.oldSyncConcept1Value = this.oldSyncConcept1Value;
        cloned.newSyncConcept1Value = this.newSyncConcept1Value;
        cloned.oldSyncConcept2Value = this.oldSyncConcept2Value;
        cloned.newSyncConcept2Value = this.newSyncConcept2Value;
        cloned.subjectTypeUUID = this.subjectTypeUUID;
        cloned.hasMigrated = this.hasMigrated;
        return cloned;
    }
}

export default SubjectMigration;
