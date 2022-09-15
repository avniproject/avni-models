import EntityMappingConfig from "../../src/Schema";
import RealmProxy from "../../src/framework/RealmProxy";
import Settings from "../../src/Settings";
import StubbedRealmDb from "./stubs/StubbedRealmDb";

import {assert} from 'chai';

describe('RealmProxyTest', () => {
  it('use indexor on collection', () => {
    const stubbedRealmDb = new StubbedRealmDb();
    const settings = new Settings();
    settings.uuid = Settings.UUID;
    stubbedRealmDb.addEntity(settings, Settings.schema.name);

    const realmProxy = new RealmProxy(stubbedRealmDb, EntityMappingConfig.getInstance());
    const settingsCollection = realmProxy.objects(Settings.schema.name);
    assert.equal(settingsCollection.length, 1);

    assert.isNotNull(settingsCollection[0]);
    assert.isDefined(settingsCollection[0]);
    assert.equal(settingsCollection[0].uuid, Settings.UUID);

    settingsCollection.forEach((x) => {
      assert.isNotNull(x);
      assert.isDefined(x)
    });

    const iterator1 = settingsCollection[Symbol.iterator]();
    for (const x of iterator1) {
      assert.isNotNull(x);
      assert.isDefined(x)
    }

    const anotherArray = [...settingsCollection];
    assert.equal(anotherArray.length, 1);
    assert.isDefined(anotherArray[0]);
  });
});
