import RealmResultsProxyHandler from "./RealmResultsProxyHandler";

//https://www.mongodb.com/docs/realm-sdks/js/latest/Realm.Collection.html
//RealmCollection as per realm documentation returns RealmResults. But there are no extra methods/properties in realm results, so we are using realm collection proxy for realm results and don't have a separate proxy class for it
class RealmResultsProxy extends Array {
  static create(realmCollection, entityClass) {
    return new Proxy(new RealmResultsProxy(realmCollection, entityClass), RealmResultsProxyHandler);
  }

  constructor(realmCollection, entityClass) {
    super();
    this.entityClass = entityClass;
    this.realmCollection = realmCollection;
  }

  createEntity(object) {
    return new this.entityClass(object);
  }

  materialiseArray() {
    // console.log("materialiseArray called");
    if (super.length !== this.realmCollection.length) {
      this.realmCollection.forEach((object, index) => {
        super.push(this.createEntity(object));
      });
    }
  }

  filtered(query, ...args) {
    return RealmResultsProxy.create(this.realmCollection.filtered(query, ...args), this.entityClass);
  }

  getAt(index) {
    return this.createEntity(this.realmCollection[index]);
  }

  forEach(callback, thisArg) {
    return this.realmCollection.forEach((object, index) => {
      return callback(this.createEntity(object), index, this);
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
      return callback(this.createEntity(object), index, this);
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
      return callback(this.createEntity(object), index, this);
    }, thisArg);
  }

  sorted(descriptor, reverse) {
    return RealmResultsProxy.create(this.realmCollection.sorted(descriptor, reverse), this.entityClass);
  }

  sum(property) {
    return this.realmCollection.sum(property);
  }

  getLength() {
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

export default RealmResultsProxy;
