import PersistedObject from "./PersistedObject";

class UserDefinedIndividualProperty extends PersistedObject {
  static schema = {
    name: "UserDefinedIndividualProperty",
    properties: {
      name: "string",
      value: "string",
      unit: { type: "string", optional: true },
    },
  };

  constructor(that) {
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

  get unit() {
      return this.that.unit;
  }

  set unit(x) {
      this.that.unit = x;
  }
}

export default UserDefinedIndividualProperty;
