import PersistedObject from "./PersistedObject";

class EntityQueue extends PersistedObject {
  static schema = {
    name: "EntityQueue",
    properties: {
      savedAt: "date",
      entityUUID: "string",
      entity: "string",
    },
  };

  get savedAt() {
      return this.that.savedAt;
  }

  set savedAt(x) {
      this.that.savedAt = x;
  }

  get entityUUID() {
      return this.that.entityUUID;
  }

  set entityUUID(x) {
      this.that.entityUUID = x;
  }

  get entity() {
      return this.that.entity;
  }

  set entity(x) {
      this.that.entity = x;
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
