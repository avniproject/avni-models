import _ from 'lodash';
import BaseEntity from './BaseEntity';
import SchemaNames from './SchemaNames';

class Identifier extends BaseEntity{
  static schema = {
    name: SchemaNames.Identifier,
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      value: "string"
    },
  };

  get value() {
      return this.that.value;
  }

  set value(x) {
      this.that.value = x;
  }

  constructor(that = null) {
    super(that);
  }

  static fromObs(obs) {
    const identifier = new Identifier();
    if (_.isObject(obs)) {
      identifier.value = obs.value;
      identifier.uuid = obs.uuid;
    } else {
      identifier.value = obs;
    }
    return identifier;
  }

  toString() {
    return this.value;
  }

  cloneForEdit() {
    const clone = new Identifier();
    clone.uuid = this.uuid;
    clone.value = this.value;
    return clone;
  }

  getValue() {
    return this.value;
  }

  get toResource() {
    return this.value;
  }
}

export default Identifier;
