import BaseEntity from "../BaseEntity";
import _ from "lodash";

class Video extends BaseEntity {
  static schema = {
    name: "Video",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      title: "string",
      filePath: "string",
      description: { type: "string", optional: true },
      duration: { type: "double", optional: true },
      voided: { type: "bool", default: false },
    },
  };

  static create({ uuid, title, filePath, description, duration, voided }) {
    return _.assignIn(new Video(), {
      uuid,
      title,
      filePath,
      description,
      duration,
      voided
    });
  }

  static fromResource(resource) {
    return Video.create(_.assignIn({}, resource, { voided: !!resource.voided }));
  }

  cloneForReference() {
    return Video.create(_.assignIn({}, this));
  }

  get translatedFieldValue() {
    return this.title;
  }
}

export default Video;
