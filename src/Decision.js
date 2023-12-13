import PersistedObject from "./PersistedObject";

class Decision extends PersistedObject {
  static schema = {
    name: "Decision",
    embedded: true,
    properties: {
      name: "string",
      code: "string",
      value: "string",
    },
  };

   constructor(that = null) {
    super(that);
  }

  get name() {
      return this.that.name;
  }

  set name(x) {
      this.that.name = x;
  }

  get value() {
      return this.that.value;
  }

  set value(x) {
      this.that.value = x;
  }

  get code() {
      return this.that.code;
  }

  set code(x) {
      this.that.code = x;
  }

  static newInstance(name, code, value) {
    return {
      name: name,
      code: code,
      value: value,
    };
  }
}

export default Decision;
