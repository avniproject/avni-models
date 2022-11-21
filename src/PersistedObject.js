import _ from "lodash";
import RealmListProxy from "./framework/RealmListProxy";
import RealmObjectSchema from "./framework/RealmObjectSchema";

class PersistedObject {
  constructor(that) {
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

  fromObject(x) {
    if (_.isNil(x) || _.isNil(x.that)) return x;
    return x.that;
  }

  toJSON() {
    let plainJSObject;
    if (!_.isNil(this.that) && !_.isNil(this.that.objectSchema)) {
      plainJSObject = {};
      const realmObjectSchema = new RealmObjectSchema(this.that.objectSchema());
      realmObjectSchema.getAllProperties().forEach(p => plainJSObject[p] = this.that[p]);
    } else if (!_.isNil(this.that)) {
      plainJSObject = this.that;
    }
    return plainJSObject;
  }
}

export default PersistedObject;
