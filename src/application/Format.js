import _ from "lodash";
import PersistedObject from "../PersistedObject";
import SchemaNames from "../SchemaNames";

class Format extends PersistedObject {
  static map = new Map();

  static schema = {
    name: SchemaNames.Format,
    embedded: true,
    properties: {
      regex: "string",
      descriptionKey: "string",
    },
  };

  constructor(that = null) {
    super(that);
  }

  get regex() {
    return this.that.regex;
  }

  set regex(x) {
    this.that.regex = x;
  }

  get descriptionKey() {
    return this.that.descriptionKey;
  }

  set descriptionKey(x) {
    this.that.descriptionKey = x;
  }

  static fromResource(resource) {
    if (_.isNil(resource)) return null;
    const format = new Format();
    format.regex = resource.regex;
    format.descriptionKey = resource.descriptionKey;
    return format;
  }

  valid(value) {
    let regexp = Format.map.get(this.regex);
    if (_.isNil(regexp)) {
      regexp = new RegExp(this.regex);
      Format.map.set(this.regex, regexp);
    }
    return regexp.test(value);
  }
}

export default Format;
