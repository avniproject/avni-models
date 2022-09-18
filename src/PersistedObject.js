import _ from "lodash";
import RealmListProxy from "./framework/RealmListProxy";

class PersistedObject {
  constructor(that = null) {
    this.that = _.isNil(that) ? {} : that;
  }

  toEntityList(property, listItemClass) {
    const realmList = this.that[property];
    if (realmList) {
      const realmListProxy = new RealmListProxy(realmList);
      realmListProxy.pushAll(listItemClass);
      return realmListProxy;
    }
    return null;
  }

  fromEntityList(list) {
    let realmList = null;
    if (!_.isNil(list)) {
      realmList = [];
      list.forEach((x) => realmList.push(x.that));
    }
    return realmList;
  }

  toEntity(property, entityClass) {
    const propertyValue = this.that[property];
    if (_.isNil(propertyValue)) return null;

    return new entityClass(propertyValue);
  }
}

export default PersistedObject;
