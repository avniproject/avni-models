import General from "./utility/General";

class MediaQueue {
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
