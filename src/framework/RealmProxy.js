import RealmResultsProxy from "./RealmResultsProxy";
import _ from "lodash";
import {getUnderlyingRealmObject, isRealmObject} from "./RealmCollectionHelper";
import General from "../utility/General";
import RealmEmbeddedObjectHandler from "./RealmEmbeddedObjectHandler";

const isVanillaArray = function (object) {
  return !_.isNil(object) && ("RealmListProxy" !== object.constructor.name) && _.isArrayLikeObject(object);
}


class RealmProxy {
  constructor(realmDb, entityMappingConfig) {
    this.realmDb = realmDb;
    this.entityMappingConfig = entityMappingConfig;
  }

  setLogQueries(value) {
    this.logQueries = value;
  }

  objects(type) {
    const realmResultsProxy = RealmResultsProxy.create(this.realmDb.objects(type), this.entityMappingConfig.getEntityClass(type));
    realmResultsProxy.setLogQueries(this.logQueries);
    return realmResultsProxy;
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

  /**
   *
   * @param schemaName
   * @param object
   * @param updateMode , all === true, modified , never === false
   * @returns {*}
   */
  create(schemaName, object, updateMode = "never") {
    const entityClass = this.entityMappingConfig.getEntityClass(schemaName);
    const underlyingObject = getUnderlyingRealmObject(object);
    const schema = entityClass.schema;
    
    // 🚀 FRAMEWORK-LEVEL: Automatically process embedded objects for Realm 12+ safety
    const processedObject = RealmEmbeddedObjectHandler.processEmbeddedObjects(underlyingObject, schema);
    
    const mandatoryObjectSchemaProperties = _.keys(_.pickBy(schema.properties, (property) => !property.optional));
    const emptyMandatoryProperties = [];
    const saveObjectKeys = Object.keys(processedObject);
    if (updateMode === "never" || updateMode === false || _.intersection(mandatoryObjectSchemaProperties, saveObjectKeys).length > 0) {
      saveObjectKeys.forEach((x) => {
        const propertyValue = processedObject[x];
        if (_.isNil(propertyValue) && _.some(mandatoryObjectSchemaProperties, (y) => y === x)) emptyMandatoryProperties.push(x);
      });
      if (emptyMandatoryProperties.length > 0) {
        throw new Error(`${emptyMandatoryProperties.join(",")} are mandatory for ${schemaName}, Keys being saved - ${saveObjectKeys}. UUID: ${processedObject.uuid}`);
      }
    }
    const dbEntity = this.realmDb.create(schemaName, processedObject, updateMode);
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
