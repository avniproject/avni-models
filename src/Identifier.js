class Identifier {
  constructor(value, uuid) {
    this.value = value;
    this.uuid = uuid;
  }

  static fromObs(obs) {
    return _.isObject(obs) ? new Identifier(obs.value, obs.uuid) : new Identifier(obs);
  }

  toString() {
    return this.value;
  }

  cloneForEdit() {
    return new Identifier(this.value, this.uuid);
  }

  getValue() {
    return this.value;
  }

  get toResource() {
    return this.value;
  }
}

export default Identifier;
