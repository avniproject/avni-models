import _ from "lodash";

class StubbedRealmDb {
  constructor() {
    this.map = new Map();
  }

  objects(type) {
    return this.map.get(type);
  }

  addEntity(x, type) {
    if (_.isNil(this.map.get(type)))
      this.map.set(type, [x]);
    else
      this.map.get(type).push(x);
  }
}

export default StubbedRealmDb;
