import BaseEntity from "./BaseEntity";

class EntityQueue extends BaseEntity{
  static schema = {
    name: "EntityQueue",
    properties: {
      savedAt: "date",
      entityUUID: "string",
      entity: "string",
    },
  };

  mapNonPrimitives(realmObject, entityMapper) {
  }

  static create(entity, schema, savedAt = new Date()) {
    var entityQueue = new EntityQueue();
    entityQueue.entityUUID = entity.uuid;
    entityQueue.entity = schema;
    entityQueue.savedAt = savedAt;
    return entityQueue;
  }
}

export default EntityQueue;
