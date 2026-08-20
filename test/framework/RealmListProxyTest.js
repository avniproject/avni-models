import {assert} from 'chai';
import _ from "lodash";
import RealmListProxy from "../../src/framework/RealmListProxy";
import ah from "../../src/framework/ArrayHelper";
import {EntitySyncStatus} from "../../src";

describe('RealmListProxyTest', () => {
  it('use with lodash', () => {
    const realmListProxy = new RealmListProxy([]);
    realmListProxy.push("a");
    assert.equal(realmListProxy.length, 1);
    assert.equal(realmListProxy.realmList.length, 1);
    _.remove(realmListProxy, () => true);
    assert.equal(realmListProxy.length, 0);
    //following is not the behavior we want, hence array helper
    assert.equal(realmListProxy.realmList.length, 1);
  });

  it('use with array helper', () => {
    const realmListProxy = new RealmListProxy([]);
    realmListProxy.push("a");
    assert.equal(realmListProxy.length, 1);
    assert.equal(realmListProxy.realmList.length, 1);
    ah.remove(realmListProxy, () => true);
    assert.equal(realmListProxy.length, 0);
    assert.equal(realmListProxy.realmList.length, 0);
  });

  /*
  The proxy holds avni wrappers on the array side and the objects realm gave us on the realmList side.
  Anything heading for realmList has to be reduced to the latter, or realm 12 rejects it with
  "Unable to convert an object with ctor 'X' to a Mixed". push unwrapped wrappers but wrote undefined for
  anything else; splice and unshift forwarded whatever they were given, wrappers included.
   */
  describe('writes reaching the underlying realm list', () => {
    const wrap = (realmObject) => new EntitySyncStatus(realmObject);

    it('should push the underlying object to realm and keep the wrapper on the array', () => {
      const realmList = [];
      const realmObject = {uuid: "uuid-1"};
      const realmListProxy = new RealmListProxy(realmList);

      realmListProxy.push(wrap(realmObject));

      assert.strictEqual(realmList[0], realmObject);
      assert.instanceOf(realmListProxy[0], EntitySyncStatus);
    });

    it('should splice the underlying object into realm, not the wrapper', () => {
      const realmList = [];
      const realmObject = {uuid: "uuid-1"};
      const realmListProxy = new RealmListProxy(realmList);

      realmListProxy.splice(0, 0, wrap(realmObject));

      assert.strictEqual(realmList[0], realmObject);
      assert.instanceOf(realmListProxy[0], EntitySyncStatus);
    });

    it('should unshift the underlying object into realm, not the wrapper', () => {
      const realmList = [];
      const realmObject = {uuid: "uuid-1"};
      const realmListProxy = new RealmListProxy(realmList);

      realmListProxy.unshift(wrap(realmObject));

      assert.strictEqual(realmList[0], realmObject);
      assert.instanceOf(realmListProxy[0], EntitySyncStatus);
    });

    it('should unwrap every value when several are written at once, in order', () => {
      const realmList = [];
      const first = {uuid: "uuid-1"};
      const second = {uuid: "uuid-2"};
      const realmListProxy = new RealmListProxy(realmList);

      realmListProxy.push(wrap(first), wrap(second));

      assert.strictEqual(realmList[0], first);
      assert.strictEqual(realmList[1], second);
      assert.equal(realmList.length, 2);
    });

    it('should unshift several values in order', () => {
      const realmList = [];
      const first = {uuid: "uuid-1"};
      const second = {uuid: "uuid-2"};
      const realmListProxy = new RealmListProxy(realmList);

      realmListProxy.unshift(wrap(first), wrap(second));

      assert.strictEqual(realmList[0], first);
      assert.strictEqual(realmList[1], second);
    });

    /*
    The one shape where index and count could regress alongside the unwrapping - a replacing splice.
     */
    it('should keep index and count intact while unwrapping replacement values', () => {
      const kept = {uuid: "kept"};
      const dropped = {uuid: "dropped"};
      const added = {uuid: "added"};
      const realmList = [kept, dropped];
      const realmListProxy = new RealmListProxy(realmList);
      realmListProxy.pushAll(EntitySyncStatus);

      realmListProxy.splice(1, 1, wrap(added));

      assert.deepEqual(realmList, [kept, added]);
      assert.strictEqual(realmList[1], added);
      assert.equal(realmListProxy.length, 2);
      assert.instanceOf(realmListProxy[1], EntitySyncStatus);
    });

    it('should unwrap only the wrappers when values are mixed with primitives', () => {
      const realmList = [];
      const realmObject = {uuid: "uuid-1"};
      const realmListProxy = new RealmListProxy(realmList);

      realmListProxy.push(wrap(realmObject), "uuid-2");

      assert.strictEqual(realmList[0], realmObject);
      assert.strictEqual(realmList[1], "uuid-2");
    });

    /*
    ArrayHelper.basePullAt is the live caller of splice and it only ever deletes - splice(index, 1) with
    no values. Pinning that so the unwrapping cannot disturb it.
     */
    it('should keep deleting from both sides when splice is given no values', () => {
      const realmObject = {uuid: "uuid-1"};
      const realmList = [realmObject];
      const realmListProxy = new RealmListProxy(realmList);
      realmListProxy.pushAll(EntitySyncStatus);

      realmListProxy.splice(0, 1);

      assert.equal(realmList.length, 0);
      assert.equal(realmListProxy.length, 0);
    });

    it('should hand realm a primitive as it is, rather than an undefined that', () => {
      const realmList = [];
      const realmListProxy = new RealmListProxy(realmList);

      realmListProxy.push("a");

      assert.strictEqual(realmList[0], "a");
    });
  });
});
