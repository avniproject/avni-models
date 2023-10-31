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

  create(schemaName, properties, updateMode = "never") {
    const underlyingObject = _.isNil(properties.that) ? properties : properties.that;
    const entityClass = this.entityMappingConfig.getEntityClass(schemaName);
    const mandatoryObjectSchemaProperties = this.entityMappingConfig.getMandatoryObjectSchemaProperties(schemaName);
    const emptyMandatoryProperties = [];

    const saveObjectKeys = Object.keys(underlyingObject);
    if (updateMode === "never" || updateMode === false || _.intersection(mandatoryObjectSchemaProperties, saveObjectKeys).length > 0) {
      saveObjectKeys.forEach((x) => {
        const propertyValue = underlyingObject[x];
        if (_.isNil(propertyValue) && _.some(mandatoryObjectSchemaProperties, (y) => y === x)) emptyMandatoryProperties.push(x);
      });
      if (emptyMandatoryProperties.length > 0) {
        throw new Error(`${emptyMandatoryProperties.join(",")} are mandatory for ${schemaName}, Keys being saved - ${saveObjectKeys}`);
      }
    }
    const dbEntity = this.realmDb.create(schemaName, underlyingObject, updateMode);
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

  writeCopyTo(config) {
    if (_.isNil(config.encryptionKey)) {
      delete config.encryptionKey;
    }
    return this.realmDb.writeCopyTo(config);
  }
}

export default RealmProxy;
