import {assert} from 'chai';
import EntityMetaData from "../src/EntityMetaData";
import Settings from "../src/Settings";
import Individual from "../src/Individual";

describe('EntitiesMetaDataTest', () => {
    it('entitiesLoadedFromServer', () => {
        var entitiesLoadedFromServer = EntityMetaData.entitiesLoadedFromServer();
        console.log(entitiesLoadedFromServer);
        assert.notIncludeMembers(entitiesLoadedFromServer, [Settings, Individual]);
    });

  describe('model', function () {
    it('should load an empty resourceSearchFilterURL for Extension', () => {
      const model = EntityMetaData.model();
      const extensionModel = model.find(item => item.resourceName === 'extension');
      expect(extensionModel).toBeDefined();
      expect(extensionModel.resourceSearchFilterURL).toBe('');
    });
  });
});
