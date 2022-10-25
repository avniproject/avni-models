import RealmResultsProxy from "./RealmResultsProxy";
import _ from "lodash";
import {getUnderlyingRealmObject, isRealmObject} from "./RealmCollectionHelper";
import General from "../utility/General";

const isVanillaArray = function (object) {
  return !_.isNil(object) && ("RealmListProxy" !== object.constructor.name) && _.isArrayLikeObject(object);
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
    try {
      let deleteObj = getUnderlyingRealmObject(object);
      if (_.isNil(deleteObj) && isVanillaArray(object)) {
        deleteObj = object.map(o => isRealmObject(o) ? o.that : o);
      } else if (_.isNil(deleteObj)) {
        deleteObj = object;
      }

      return this.realmDb.delete(deleteObj);
    } catch (e) {
      General.logError("RealmProxy", `Could not delete object: ${JSON.stringify(object)}`);
      throw e;
    }
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
