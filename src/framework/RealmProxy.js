import RealmResultsProxy from "./RealmResultsProxy";
import _ from "lodash";
import {getUnderlyingRealmObject, isRealmObject} from "./RealmCollectionHelper";
import General from "../utility/General";
import RealmNestedObjectHandler from "./RealmNestedObjectHandler";

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
   * Creates a new entity in the database
   * 
   * @param schemaName - The schema name of the entity to create
   * @param object - The object data (can be entity wrapper or raw object)
   * @param updateMode - Update mode: "never" (default), "modified", "all", or boolean equivalents
   * @returns {*} - The created entity wrapped in its entity class
   */
  create(schemaName, object, updateMode = "never") {
    const entityClass = this.entityMappingConfig.getEntityClass(schemaName);
    const schema = entityClass.schema;
    
    // Extract the underlying data from entity wrapper if needed
    const rawObject = getUnderlyingRealmObject(object) || object;
    
    // 🚀 FRAMEWORK-LEVEL: Automatically process nested objects for Realm 12+ safety
    // This is the only custom processing needed - Realm handles validation
    const processedObject = RealmNestedObjectHandler.processNestedObjects(rawObject, schema);
    
    // Let Realm handle all validation - it knows its schema better than we do
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
