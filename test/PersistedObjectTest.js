import {assert} from 'chai';
import PersistedObject from "../src/PersistedObject";
import {EntitySyncStatus} from "../src";

describe('PersistedObjectTest', () => {
  /*
  fromEntityList builds the array that gets assigned onto a realm property, so it is the same boundary as
  the RealmListProxy writes - what it collects has to be what realm gave us, not the avni wrapper.
   */
  describe('fromEntityList', () => {
    it('should collect the underlying objects of the wrappers it is given', () => {
      const first = {uuid: "uuid-1"};
      const second = {uuid: "uuid-2"};

      const realmList = new PersistedObject({}).fromEntityList([new EntitySyncStatus(first), new EntitySyncStatus(second)]);

      assert.strictEqual(realmList[0], first);
      assert.strictEqual(realmList[1], second);
      assert.equal(realmList.length, 2);
    });

    it('should keep a raw realm object as it is rather than collecting an undefined that', () => {
      const realmObject = {uuid: "uuid-1"};

      const realmList = new PersistedObject({}).fromEntityList([realmObject]);

      assert.strictEqual(realmList[0], realmObject);
    });

    it('should return null for a nil list', () => {
      assert.isNull(new PersistedObject({}).fromEntityList(null));
      assert.isNull(new PersistedObject({}).fromEntityList(undefined));
    });

    it('should return an empty list for an empty list', () => {
      assert.deepEqual(new PersistedObject({}).fromEntityList([]), []);
    });
  });
});
