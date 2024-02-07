import {assert} from 'chai';
import EntityMetaData from "../src/EntityMetaData";
import Settings from "../src/Settings";
import Individual from "../src/Individual";

describe('EntitiesMetaDataTest', () => {
    it('entitiesLoadedFromServer', () => {
        var entitiesLoadedFromServer = EntityMetaData.entitiesLoadedFromServer();
        assert.notIncludeMembers(entitiesLoadedFromServer, [Settings, Individual]);
        assert.notIncludeMembers(entitiesLoadedFromServer, EntityMetaData.embeddedEntities());
    });

  describe('model', function () {
    it('should load correct values for extensions', () => {
      const model = EntityMetaData.model();
      const extensionModel = model.find(item => item.entityName === 'Extension');
      expect(extensionModel).toBeDefined();
      expect(extensionModel.resourceSearchFilterURL).toBe('');
      expect(extensionModel.resourceName).toBe('extensions');
    });
  });
});
