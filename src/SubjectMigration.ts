import General from "./utility/General";
import BaseEntity from "./BaseEntity";
import ResourceUtil from "./utility/ResourceUtil";

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
        }
    };

    uuid: string;
    subjectUUID: string;
    oldAddressLevelUUID: string;
    newAddressLevelUUID: string;
    oldSyncConcept1Value: string;
    newSyncConcept1Value: string;
    oldSyncConcept2Value: string;
    newSyncConcept2Value: string;
    subjectTypeUUID: string;
    hasMigrated: boolean;

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
