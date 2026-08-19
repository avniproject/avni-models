import {assert} from 'chai';
import _ from "lodash";
import RealmResultsProxy from "../../src/framework/RealmResultsProxy";
import RealmListProxy from "../../src/framework/RealmListProxy";
import StubbedRealmCollection from "./stubs/StubbedRealmCollection";
import {EntitySyncStatus} from "../../src";

describe('RealmResultsProxyTest', () => {
  it('foo', () => {
    const realmResultsProxy = RealmResultsProxy.create(["a"], EntitySyncStatus);
    assert.equal(realmResultsProxy.length, 1);
    let realmResultsProxyElement = realmResultsProxy[0];
    assert.equal(realmResultsProxyElement.that, "a");
  });

  it('should get type info', function () {
    const realmResultsProxy = RealmResultsProxy.create(["a"], EntitySyncStatus);
    assert.equal(realmResultsProxy.constructor.name, "RealmResultsProxy");
  });

  describe('filtered', () => {
    const filterOn = function (...args) {
      const realmCollection = new StubbedRealmCollection();
      RealmResultsProxy.create(realmCollection, EntitySyncStatus).filtered("entityName = $0", ...args);
      return realmCollection;
    };

    it('should pass the entity underlying an avni wrapper to realm, not the wrapper', () => {
      const realmObject = {uuid: "uuid-1", entityName: "Individual"};
      const realmCollection = filterOn(new EntitySyncStatus(realmObject));

      assert.equal(realmCollection.filteredArgs.length, 1);
      assert.strictEqual(realmCollection.filteredArgs[0], realmObject);
    });

    it('should unwrap every wrapper in an array of wrappers, as used by IN queries', () => {
      const first = {uuid: "uuid-1"};
      const second = {uuid: "uuid-2"};
      const realmCollection = filterOn([new EntitySyncStatus(first), new EntitySyncStatus(second)]);

      assert.deepEqual(realmCollection.filteredArgs[0], [first, second]);
      assert.strictEqual(realmCollection.filteredArgs[0][0], first);
      assert.strictEqual(realmCollection.filteredArgs[0][1], second);
    });

    it('should unwrap the wrappers in an array that also holds primitives', () => {
      const realmObject = {uuid: "uuid-1"};
      const realmCollection = filterOn([new EntitySyncStatus(realmObject), "uuid-2"]);

      assert.strictEqual(realmCollection.filteredArgs[0][0], realmObject);
      assert.equal(realmCollection.filteredArgs[0][1], "uuid-2");
    });

    it('should unwrap a realm list proxy to its underlying list', () => {
      const realmList = [{uuid: "uuid-1"}];
      const realmCollection = filterOn(new RealmListProxy(realmList));

      assert.strictEqual(realmCollection.filteredArgs[0], realmList);
    });

    it('should unwrap a results proxy to its underlying collection', () => {
      const otherCollection = new StubbedRealmCollection({uuid: "uuid-1"});
      const realmCollection = filterOn(RealmResultsProxy.create(otherCollection, EntitySyncStatus));

      assert.strictEqual(realmCollection.filteredArgs[0], otherCollection);
    });

    it('should pass primitives through untouched, including falsy ones', () => {
      const date = new Date("2020-01-01");
      const realmCollection = filterOn("Individual", 0, false, "", date, null, undefined);

      assert.deepEqual(realmCollection.filteredArgs.slice(0, 4), ["Individual", 0, false, ""]);
      assert.strictEqual(realmCollection.filteredArgs[4], date);
      assert.isNull(realmCollection.filteredArgs[5]);
      assert.isUndefined(realmCollection.filteredArgs[6]);
      assert.equal(realmCollection.filteredArgs.length, 7);
    });

    it('should pass an array of primitives through by value, leaving the caller its own array', () => {
      const uuids = ["uuid-1", "uuid-2"];
      const realmCollection = filterOn(uuids);

      assert.deepEqual(realmCollection.filteredArgs[0], uuids);
      assert.notStrictEqual(realmCollection.filteredArgs[0], uuids);
      assert.deepEqual(uuids, ["uuid-1", "uuid-2"]);
    });

    it('should leave the query itself alone', () => {
      const realmCollection = filterOn("Individual");

      assert.equal(realmCollection.filteredQuery, "entityName = $0");
    });

    /*
    The unwrapped args are of no use in a query log - they print as bare realm objects. Logging has to
    stay ahead of the unwrapping for the logs to remain readable.
     */
    it('should log the args as the caller passed them, not as they were unwrapped', () => {
      const logged = [];
      const realLog = console.log;
      console.log = (...args) => logged.push(args);

      try {
        const wrapper = new EntitySyncStatus({uuid: "uuid-1"});
        const realmResultsProxy = RealmResultsProxy.create(new StubbedRealmCollection(), EntitySyncStatus);
        realmResultsProxy.setLogQueries(true);
        realmResultsProxy.filtered("entityName = $0", wrapper);

        assert.equal(logged.length, 1);
        assert.strictEqual(_.last(logged[0]), wrapper);
      } finally {
        console.log = realLog;
      }
    });

    it('should keep returning a results proxy of the entity class', () => {
      const realmResultsProxy = RealmResultsProxy.create(new StubbedRealmCollection(), EntitySyncStatus)
        .filtered("entityName = $0", "Individual");

      assert.equal(realmResultsProxy.constructor.name, "RealmResultsProxy");
      assert.equal(realmResultsProxy.length, 0);
    });
  });
});
