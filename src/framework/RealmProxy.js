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
    const processedObject = RealmNestedObjectHandler.processNestedObjects(rawObject, schema);
    
    // Lightweight validation: Check for null/undefined mandatory properties  
    // This provides clear error messages for debugging production issues
    // Validates when:
    // 1. In strict creation mode ("never" or false), OR
    // 2. Touching any mandatory property (prevents setting mandatory fields to null)
    const mandatoryObjectSchemaProperties = this.entityMappingConfig.getMandatoryObjectSchemaProperties(schemaName);
    const saveObjectKeys = Object.keys(processedObject);
    
    if (updateMode === "never" || updateMode === false || 
        _.intersection(mandatoryObjectSchemaProperties, saveObjectKeys).length > 0) {
      const emptyMandatoryProperties = [];
      
      saveObjectKeys.forEach((key) => {
        const propertyValue = processedObject[key];
        if (_.isNil(propertyValue) && _.some(mandatoryObjectSchemaProperties, (mandatoryProp) => mandatoryProp === key)) {
          emptyMandatoryProperties.push(key);
        }
      });
      
      if (emptyMandatoryProperties.length > 0) {
        throw new Error(
          `${emptyMandatoryProperties.join(",")} are mandatory for ${schemaName}, ` +
          `Keys being saved - ${saveObjectKeys.join(",")}. UUID: ${processedObject.uuid}`
        );
      }
    }
    
    // Let Realm handle remaining validation (types, constraints, etc.)
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
