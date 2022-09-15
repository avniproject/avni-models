import RealmCollectionProxyHandler from "./RealmCollectionProxyHandler";
import RealmCollectionProxy from "./RealmCollectionProxy";

class RealmProxy {
    constructor(realmDb, entityMappingConfig) {
        this.realmDb = realmDb;
        this.entityMappingConfig = entityMappingConfig;
    }

    objects(type) {
        const realmCollectionProxy = new RealmCollectionProxy(this.realmDb.objects(type), this.entityMappingConfig.getEntityClass(type));
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

    create(type, properties, updateMode) {
        return this.realmDb.create(type, properties.that, updateMode);
    }

    delete(object) {
        return this.realmDb.delete(object.that);
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
