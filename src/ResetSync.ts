import BaseEntity from "./BaseEntity";
import ResourceUtil from "./utility/ResourceUtil";

class ResetSync extends BaseEntity {
    static schema = {
        name: 'ResetSync',
        primaryKey: 'uuid',
        properties: {
            uuid: 'string',
            subjectTypeUUID: {type: 'string', optional: true},
            hasMigrated: {type: 'bool', default: false},
            voided: {type: "bool", default: false},
        }
    };

  constructor(that) {
    super(that);
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

  static fromResource(resource) {
        const resetSync = new ResetSync();
        resetSync.uuid = resource.uuid;
        resetSync.voided = resource.voided;
        resetSync.subjectTypeUUID = ResourceUtil.getUUIDFor(resource, 'subjectTypeUUID');
        return resetSync;
    }

    updatedHasMigrated() {
        const resetSync = this.clone();
        resetSync.hasMigrated = true;
        return resetSync;
    }

    clone() {
        const resetSync = new ResetSync();
        resetSync.uuid = this.uuid;
        resetSync.subjectTypeUUID = this.subjectTypeUUID;
        resetSync.hasMigrated = this.hasMigrated;
        resetSync.voided = this.voided;
        return resetSync;
    }
}


export default ResetSync;
