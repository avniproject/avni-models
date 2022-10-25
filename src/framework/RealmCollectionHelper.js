import _ from "lodash";

const isRealmList = function (object) {
  return !_.isNil(object) && !_.isNil(object.realmList);
}

const isRealmResults = function (object) {
  return !_.isNil(object) && !_.isNil(object.realmCollection);
}

export const isRealmObject = function (object) {
  return !_.isNil(object) && !_.isNil(object.that);
}

export function getUnderlyingRealmCollection(object) {
  if (isRealmResults(object))
    return object.realmCollection;
  else if (isRealmList(object))
    return object.realmList;
  return null;
}

export function getUnderlyingRealmObject(object) {
  return isRealmObject(object) ? object.that : getUnderlyingRealmCollection(object);
}
