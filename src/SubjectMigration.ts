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
      oldAddressLevelUUID: 'string',
      newAddressLevelUUID: 'string',
      hasMigrated: {type: 'bool', default: false},
    }
  };

  uuid: string;
  subjectUUID: string;
  oldAddressLevelUUID: string;
  newAddressLevelUUID: string;
  hasMigrated: boolean;

  static create(subjectUUID, oldAddressLevelUUID, newAddressLevelUUID) {
    let subjectMigration = new SubjectMigration();
    subjectMigration.uuid = General.randomUUID();
    subjectMigration.subjectUUID = subjectUUID;
    subjectMigration.oldAddressLevelUUID = oldAddressLevelUUID;
    subjectMigration.newAddressLevelUUID = newAddressLevelUUID;
    return subjectMigration;
  }

  static fromResource(resource) {
    const subjectMigration = new SubjectMigration();
    subjectMigration.uuid = resource.uuid;
    subjectMigration.subjectUUID = ResourceUtil.getUUIDFor(resource, 'individualUUID');
    subjectMigration.oldAddressLevelUUID = ResourceUtil.getUUIDFor(resource, 'oldAddressLevelUUID');
    subjectMigration.newAddressLevelUUID = ResourceUtil.getUUIDFor(resource, 'newAddressLevelUUID');
    return subjectMigration;
  }

  clone() {
    const cloned = new SubjectMigration();
    cloned.uuid = this.uuid;
    cloned.subjectUUID = this.subjectUUID;
    cloned.oldAddressLevelUUID = this.oldAddressLevelUUID;
    cloned.newAddressLevelUUID = this.newAddressLevelUUID;
    cloned.hasMigrated = this.hasMigrated;
    return cloned;
  }
}

export default SubjectMigration;
