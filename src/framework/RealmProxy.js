import RealmResultsProxy from "./RealmResultsProxy";
import _ from "lodash";

const isVanillaArray = function (object) {
  return !_.isNil(object) && ("RealmListProxy" !== object.constructor.name) && _.isArrayLikeObject(object);
}

const isRealmList = function (object) {
  return !_.isNil(object) && !_.isNil(object.realmList);
}

const isRealmResults = function (object) {
  return !_.isNil(object) && !_.isNil(object.realmCollection);
}

const isRealmObject = function (object) {
  return !_.isNil(object) && !_.isNil(object.that);
}

class RealmProxy {
  constructor(realmDb, entityMappingConfig) {
    this.realmDb = realmDb;
    this.entityMappingConfig = entityMappingConfig;
  }

  objects(type) {
    return RealmResultsProxy.create(this.realmDb.objects(type), this.entityMappingConfig.getEntityClass(type));
  }

  get isInTransaction() {
    return this.realmDb.isInTransaction;
  }

  get path() {
    return this.realmDb.path;
  }

  get schema() {
    return this.realmDb.schema;
  }

  get schemaVersion() {
    return this.realmDb.schemaVersion;
  }

  close() {
    return this.realmDb.close();
  }

  create(type, properties, updateMode = "never") {
    const createProperties = _.isNil(properties.that) ? properties : properties.that;
    const entityClass = this.entityMappingConfig.getEntityClass(type);
    const dbEntity = this.realmDb.create(type, createProperties, updateMode);
    return new entityClass(dbEntity);
  }

  delete(object) {
    let deleteObj = object;
    if (isRealmObject(object))
      deleteObj = object.that;
    else if (isRealmResults(object))
      deleteObj = object.realmCollection;
    else if (isRealmList(object))
      deleteObj = object.realmList;
    else if (isVanillaArray(object)) {
      deleteObj = object.map(o => isRealmObject(o) ? o.that : o);
    }

    return this.realmDb.delete(deleteObj);
  }

  objectForPrimaryKey(type, key) {
    const entityClass = this.entityMappingConfig.getEntityClass(type);
    return new entityClass(this.realmDb.objectForPrimaryKey(type, key));
  }

  write(callback) {
    return this.realmDb.write(callback);
  }

  writeCopyTo(pathOrConfig, encryptionKey) {
    return this.realmDb.writeCopyTo(pathOrConfig, encryptionKey);
  }
}

export default RealmProxy;
