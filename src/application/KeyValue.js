import PersistedObject from "../PersistedObject";

class KeyValue extends PersistedObject {
  static schema = {
    name: "KeyValue",
    properties: {
      key: "string",
      value: "string",
    },
  };

  static fromResource(resource) {
    const keyValue = new KeyValue();
    keyValue.key = resource.key;
    keyValue.value = JSON.stringify(resource.value);
    return keyValue;
  }

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

  getValue() {
    try {
      return JSON.parse(this.value);
    } catch (e) {
      return this.value;
    }
  }
}

export default KeyValue;
