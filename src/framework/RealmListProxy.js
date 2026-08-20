import {unwrapForRealm} from "./RealmCollectionHelper";

/*
The array side of this proxy holds avni wrappers; the realmList side holds what realm gave us. So each
mutating method overridden below unwraps values on the way to realmList - realm 12 rejects the wrapper -
while keeping the wrappers on the array side, which is the point of the proxy.

Only the methods below are overridden. sort, reverse, fill and copyWithin are not, and mutate the array
side while leaving realmList untouched; nor can index assignment or setting length be intercepted, since
this is an Array subclass rather than a Proxy. Long standing, and no caller does any of it.
 */
// Extends only methods that mutate the array, others methods needn't be extended as the behavior can be
class RealmListProxy extends Array {
  constructor(realmList) {
    super();
    this.realmList = realmList;
  }

  /*
  Not to be used by external callers. Cannot be done in the constructor as somehow array doesn't take this via super()
   */
  pushAll(listItemClass) {
    this.realmList.forEach((x) => super.push(new listItemClass(x)));
  }

  pop() {
    this.realmList.pop();
    return super.pop();
  }

  push(...values) {
    super.push(...values);
    values.forEach((x) => this.realmList.push(unwrapForRealm(x)));
  }

  shift() {
    this.realmList.shift();
    return super.shift();
  }

  splice(index, count, ...values) {
    this.realmList.splice(index, count, ...values.map(unwrapForRealm));
    return super.splice(index, count, ...values);
  }

  unshift(...values) {
    super.unshift(...values);
    return this.realmList.unshift(...values.map(unwrapForRealm));
  }
}

export default RealmListProxy;
