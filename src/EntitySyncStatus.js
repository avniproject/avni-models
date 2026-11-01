import BaseEntity from "./BaseEntity";
import SchemaNames from "./SchemaNames";

class EntitySyncStatus extends BaseEntity {
  static REALLY_OLD_DATE = new Date("1900-01-01");

  static schema = {
    name: SchemaNames.EntitySyncStatus,
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      entityName: "string",
      loadedSince: "date",
      entityTypeUuid: "string",
      // Uuid of the last row received at loadedSince. With loadedSince it is the resume cursor
      // (avniproject/avni-client#2099), so rows sharing one timestamp are not downloaded again.
      lastUuid: {type: "string", optional: true},
    },
  };

   constructor(that = null) {
    super(that);
  }

  get entityName() {
      return this.that.entityName;
  }

  set entityName(x) {
      this.that.entityName = x;
  }

  get loadedSince() {
      return this.that.loadedSince;
  }

  set loadedSince(x) {
      this.that.loadedSince = x;
  }

  get entityTypeUuid() {
      return this.that.entityTypeUuid;
  }

  set entityTypeUuid(x) {
      this.that.entityTypeUuid = x;
  }

  get lastUuid() {
      return this.that.lastUuid;
  }

  set lastUuid(x) {
      this.that.lastUuid = x;
  }

  static create(entityName, date, uuid, entityTypeUuid, lastUuid = null) {
    var entitySyncStatus = new EntitySyncStatus();
    entitySyncStatus.uuid = uuid;
    entitySyncStatus.entityName = entityName;
    entitySyncStatus.loadedSince = date;
    entitySyncStatus.entityTypeUuid = entityTypeUuid;
    entitySyncStatus.lastUuid = lastUuid;
    return entitySyncStatus;
  }

  toJSON() {
    return {
      uuid: this.uuid,
      entityName: this.entityName,
      loadedSince: this.loadedSince,
      entityTypeUuid: this.entityTypeUuid,
      lastUuid: this.lastUuid,
      voided: this.voided,
    };
  }
}

export default EntitySyncStatus;
