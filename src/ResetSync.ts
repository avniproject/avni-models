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

  constructor(that = null) {
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

  // hasMigrated is a device-side decision — it records that this reset has already
  // been honoured — and the server neither holds nor returns it. The wipe re-seeds the
  // ResetSync checkpoint at 1900, so later syncs re-pull rows that are already done;
  // carry the local flag across so a server-shaped resource cannot un-mark them.
  //
  // Left ABSENT when there is no local row, never set to false: both persist paths
  // upsert only the properties present on the object, so an explicit false would
  // overwrite a local true. A genuinely new row takes the schema default of false.
  static fromResource(resource, entityService) {
    const resetSync = new ResetSync();
    resetSync.uuid = resource.uuid;
    resetSync.voided = resource.voided;
    resetSync.subjectTypeUUID = ResourceUtil.getUUIDFor(resource, 'subjectTypeUUID');
    const existing = entityService && entityService.findByKey("uuid", resource.uuid, ResetSync.schema.name);
    if (existing) resetSync.hasMigrated = existing.hasMigrated;
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
