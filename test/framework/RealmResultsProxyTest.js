import {assert} from 'chai';
import _ from "lodash";
import RealmResultsProxy from "../../src/framework/RealmResultsProxy";
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
});
