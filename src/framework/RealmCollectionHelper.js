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

/*
Realm 12 rejects avni wrappers handed to it ("Unable to convert an object with ctor 'X' to a Mixed"), so
anything crossing into realm - a query argument or a value written to a list - is reduced to what realm
gave us. Primitives, dates and nils have no underlying object and are returned as they came.

Fails open: a wrapper whose that is nil is returned as the wrapper, which realm would then reject. That
is unreachable for avni entities, since PersistedObject gives every wrapper at least an empty that.

This is the canonical form, but it is not yet the only one. RealmProxy.create and RealmProxy.delete carry
their own variants that differ in ways that are deliberate rather than accidental - create uses || rather
than a nil check, delete has an isVanillaArray branch that does not unwrap nested collections - and
BaseEntity._setChild and PersistedObject.fromObject each have a third and fourth. They are left alone
here because create and delete are hot paths whose divergences want their own change, not a drive-by.
 */
export function unwrapForRealm(value) {
  const underlyingObject = getUnderlyingRealmObject(value);
  return _.isNil(underlyingObject) ? value : underlyingObject;
}
