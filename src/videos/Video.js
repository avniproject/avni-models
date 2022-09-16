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

   constructor(that = null) {
    super(that);
  }

  get title() {
      return this.that.title;
  }

  set title(x) {
      this.that.title = x;
  }

  get filePath() {
      return this.that.filePath;
  }

  set filePath(x) {
      this.that.filePath = x;
  }

  get description() {
      return this.that.description;
  }

  set description(x) {
      this.that.description = x;
  }

  get duration() {
      return this.that.duration;
  }

  set duration(x) {
      this.that.duration = x;
  }

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
