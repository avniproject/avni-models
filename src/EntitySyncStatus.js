import BaseEntity from "./BaseEntity";

class EntitySyncStatus extends BaseEntity {
  static REALLY_OLD_DATE = new Date("1900-01-01");

  static schema = {
    name: "EntitySyncStatus",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      entityName: "string",
      loadedSince: "date",
      entityTypeUuid: "string",
    },
  };

  static create(entityName, date, uuid, entityTypeUuid) {
    var entitySyncStatus = new EntitySyncStatus();
    entitySyncStatus.uuid = uuid;
    entitySyncStatus.entityName = entityName;
    entitySyncStatus.loadedSince = date;
    entitySyncStatus.entityTypeUuid = entityTypeUuid;
    return entitySyncStatus;
  }
}

export default EntitySyncStatus;
