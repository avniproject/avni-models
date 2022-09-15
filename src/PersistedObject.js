import _ from "lodash";
import RealmListProxy from "./framework/RealmListProxy";

class PersistedObject {
  constructor(that) {
    this.that = _.isNil(that) ? {} : that;
  }

  // This check is used to not unnecessarily return our realm proxies in context where model library is used outside avni client
  isThatARealmObject() {
    return !_.isNil(this.that.objectSchema);
  }

  toList(property, listItemClass) {
    if (this.isThatARealmObject())
      return new RealmListProxy(this.that[property], listItemClass);
    return this.that[property];
  }

  toEntity(property, entityClass) {
    const propertyValue = this.that[property];
    if (_.isNil(propertyValue)) return null;

    return new entityClass(propertyValue);
  }
}

export default PersistedObject;
