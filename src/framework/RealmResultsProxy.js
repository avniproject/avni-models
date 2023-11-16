import RealmResultsProxyHandler from "./RealmResultsProxyHandler";
import _ from "lodash";

//https://www.mongodb.com/docs/realm-sdks/js/latest/Realm.Collection.html
//RealmCollection as per realm documentation returns RealmResults. But there are no extra methods/properties in realm results, so we are using realm collection proxy for realm results and don't have a separate proxy class for it
class RealmResultsProxy {
  static create(realmCollection, entityClass) {
    return new Proxy(new RealmResultsProxy(realmCollection, entityClass), RealmResultsProxyHandler);
  }

  constructor(realmCollection, entityClass) {
    this.entityClass = entityClass;
    this.realmCollection = realmCollection;
    this.array = [];
  }

  setLogQueries(value) {
    this.logQueries = value;
  }

  createEntity(object) {
    return new this.entityClass(object);
  }

  asArray() {
    this.materialiseArray();
    return this.array;
  }

  materialiseArray() {
    if (this.array.length !== this.realmCollection.length) {
      this.realmCollection.forEach((object, index) => {
        this.array.push(this.createEntity(object));
      });
    }
  }

  filter(predicate, thisArg) {
    this.materialiseArray();
    return this.array.filter(predicate, thisArg);
  }

  /*
  Uses underlying collection. The objects would not have access to business methods on avni model
   */
  filterInternal(predicate, thisArg) {
    return this.realmCollection.filter(predicate, thisArg);
  }

  filtered(query, ...args) {
    if (this.logQueries)
      console.log(this.entityClass, query, ...args);
    return RealmResultsProxy.create(this.realmCollection.filtered(query, ...args), this.entityClass);
  }

  getAt(index) {
    if (this.realmCollection.length <= index) return null;

    const realmCollectionElement = this.realmCollection[index];
    if (_.isNil(realmCollectionElement)) return null;
    return this.createEntity(realmCollectionElement);
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

  /*
  Uses underlying collection. The objects would not have access to business methods on avni model
   */
  mapInternal(callback, thisArg) {
    return this.realmCollection.map((object, index) => {
      return callback(object, index, this);
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
    const realmCollection = _.isNil(reverse) ? this.realmCollection.sorted(descriptor) : this.realmCollection.sorted(descriptor, reverse);
    return RealmResultsProxy.create(realmCollection, this.entityClass);
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

  find(filterCallback, thisArg) {
    const findFunc = (object, index, collection) => {
      return filterCallback(this.createEntity(object), index, this);
    };
    return _.isNil(thisArg) ? this.realmCollection.find(findFunc) : this.realmCollection.find(findFunc, thisArg);
  }
}

export default RealmResultsProxy;
