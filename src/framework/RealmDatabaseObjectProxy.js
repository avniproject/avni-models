import _ from "lodash";

class RealmDatabaseObjectProxy {
  constructor(entityClass) {
    this.entityClass = entityClass;
  }

  createEntity(object) {
    return new this.entityClass(object);
  }
}

export default RealmDatabaseObjectProxy;
