import RealmCollectionProxyHandler from "./RealmCollectionProxyHandler";
import RealmDatabaseObjectProxy from "./RealmDatabaseObjectProxy";

//https://www.mongodb.com/docs/realm-sdks/js/latest/Realm.Collection.html
//RealmCollection as per realm documentation returns RealmResults. But there are no extra methods/properties in realm results, so we are using realm collection proxy for realm results and don't have a separate proxy class for it
class RealmCollectionProxy extends RealmDatabaseObjectProxy {
  constructor(realmCollection, entityClass) {
    super(entityClass);
    this.realmCollection = realmCollection;
  }

  _realmResultsWithProxy(realmCollection) {
    return new Proxy(new RealmCollectionProxy(realmCollection, this.entityClass), RealmCollectionProxyHandler);
  }

  filtered(query, ...args) {
    return this._realmResultsWithProxy(this.realmCollection.filtered(query, ...args));
  }

  getAt(index) {
    return this.createEntity(this.realmCollection[index]);
  }

  forEach(callback, thisArg) {
    return this.realmCollection.forEach((object, index) => {
      callback(this.createEntity(object), index, this);
    }, thisArg);
  }

  isEmpty() {
    return this.realmCollection.isEmpty();
  }

  join(separator) {
    return this.realmCollection.join(separator);
  }

  map(callback, thisArg) {
    return this.realmCollection.map((object, index) => {
      callback(this.createEntity(object), index, this);
    }, thisArg);
  }

  max(property) {
    return this.realmCollection.max(property);
  }

  min(property) {
    return this.realmCollection.min(property);
  }

  slice(start, end) {
    return this.realmCollection.slice(start, end).map((x) => this.createEntity(x));
  }

  some(callback, thisArg) {
    return this.realmCollection.some((object, index, collection) => {
      callback(this.createEntity(object), index, this);
    }, thisArg);
  }

  sorted(descriptor, reverse) {
    return this._realmResultsWithProxy(this.realmCollection.sorted(descriptor, reverse));
  }

  sum(property) {
    return this.realmCollection.sum(property);
  }

  get length() {
    return this.realmCollection.length;
  }

  get optional() {
    return this.realmCollection.optional;
  }

  get type() {
    return this.realmCollection.type;
  }

  [Symbol.iterator]() {
    return this.realmCollection.map((x) => new this.entityClass(x))[Symbol.iterator]();
  }
}

export default RealmCollectionProxy;
