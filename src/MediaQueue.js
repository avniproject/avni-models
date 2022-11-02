import General from "./utility/General";
import BaseEntity from "./BaseEntity";

class MediaQueue extends BaseEntity {
  static schema = {
    name: "MediaQueue",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      entityUUID: "string",
      entityName: "string",
      entityTargetField: "string",
      fileName: "string",
      type: "string",
      conceptUUID: {type: "string", optional: true},
    },
  };

  constructor(that = null) {
    super(that);
  }

  get entityUUID() {
      return this.that.entityUUID;
  }

  set entityUUID(x) {
      this.that.entityUUID = x;
  }

  get entityName() {
      return this.that.entityName;
  }

  set entityName(x) {
      this.that.entityName = x;
  }

  get entityTargetField() {
      return this.that.entityTargetField;
  }

  set entityTargetField(x) {
      this.that.entityTargetField = x;
  }

  get fileName() {
      return this.that.fileName;
  }

  set fileName(x) {
      this.that.fileName = x;
  }

  get type() {
      return this.that.type;
  }

  set type(x) {
      this.that.type = x;
  }

  get conceptUUID() {
      return this.that.conceptUUID;
  }

  set conceptUUID(x) {
      this.that.conceptUUID = x;
  }

  static create(entityUUID, entityName, fileName, type, entityTargetField, conceptUUID, uuid = General.randomUUID()) {
    var mediaQueue = new MediaQueue();
    mediaQueue.entityUUID = entityUUID;
    mediaQueue.uuid = uuid;
    mediaQueue.entityName = entityName;
    mediaQueue.entityTargetField = entityTargetField;
    mediaQueue.fileName = fileName;
    mediaQueue.type = type;
    mediaQueue.conceptUUID = conceptUUID;
    return mediaQueue;
  }

  clone() {
    const mediaQueueItem = new MediaQueue();
    mediaQueueItem.uuid = this.uuid;
    mediaQueueItem.entityUUID = this.entityUUID;
    mediaQueueItem.entityName = this.entityName;
    mediaQueueItem.entityTargetField = this.entityTargetField;
    mediaQueueItem.fileName = this.fileName;
    mediaQueueItem.type = this.type;
    mediaQueueItem.conceptUUID = this.conceptUUID;
    return mediaQueueItem;
  }
}

export default MediaQueue;
