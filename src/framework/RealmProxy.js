import RealmCollectionProxyHandler from "./RealmCollectionProxyHandler";
import RealmResultsProxy from "./RealmResultsProxy";

class RealmProxy {
  constructor(realmDb, entityMappingConfig) {
    this.realmDb = realmDb;
    this.entityMappingConfig = entityMappingConfig;
  }

  objects(type) {
    const realmCollectionProxy = new RealmResultsProxy(this.realmDb.objects(type), this.entityMappingConfig.getEntityClass(type));
    return new Proxy(realmCollectionProxy, RealmCollectionProxyHandler);
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
    let createProperties = _.isNil(properties.that) ? properties : properties.that;
    return this.realmDb.create(type, createProperties, updateMode);
  }

  delete(object) {
    let deleteObj = object;
    if (!_.isNil(object.that))
      deleteObj = object.that;
    else if (!_.isNil(object.realmCollection))
      deleteObj = object.realmCollection;

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
