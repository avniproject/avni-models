import PersistedObject from "../PersistedObject";

class StringKeyNumericValue extends PersistedObject {
  static schema = {
    name: "StringKeyNumericValue",
    properties: {
      key: "string",
      value: "double",
    },
  };

   constructor(that = null) {
    super(that);
  }

  get key() {
      return this.that.key;
  }

  set key(x) {
      this.that.key = x;
  }

  get value() {
      return this.that.value;
  }

  set value(x) {
      this.that.value = x;
  }

  static fromResource(key, value) {
    const stringKeyNumericValue = new StringKeyNumericValue();
    stringKeyNumericValue.key = key;
    stringKeyNumericValue.value = value;
    return stringKeyNumericValue;
  }

  get toResource() {
    const resource = {};
    resource[this.key] = this.value;
    return resource;
  }

  getValue() {}
}

export default StringKeyNumericValue;
