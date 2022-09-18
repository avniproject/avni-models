import {assert} from 'chai';
import _ from "lodash";
import RealmListProxy from "../../src/framework/RealmListProxy";
import ah from "../../src/framework/ArrayHelper";

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
});
