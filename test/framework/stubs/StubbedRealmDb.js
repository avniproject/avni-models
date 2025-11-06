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

  create(schemaName, object, updateMode) {
    this.createdEntity = object;
    this.createUpdateMode = updateMode;
    this.createSchemaName = schemaName;
    return object.that || object; // Return the underlying object for entity creation
  }

  delete(object) {
    this.deletedObject = object;
  }
}

export default StubbedRealmDb;
