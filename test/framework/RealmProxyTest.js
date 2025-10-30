import EntityMappingConfig from "../../src/Schema";
import RealmProxy from "../../src/framework/RealmProxy";
import Settings from "../../src/Settings";
import StubbedRealmDb from "./stubs/StubbedRealmDb";
import {assert} from 'chai';
import {Encounter, EncounterType} from "../../src";
import _ from 'lodash';
import RealmResultsProxy from "../../src/framework/RealmResultsProxy";
import PersistedObject from "../../src/PersistedObject";
import RealmListProxy from "../../src/framework/RealmListProxy";

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
      assert.isDefined(x);
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

  it('should _.get', function () {
    const encounter = new Encounter();
    encounter.encounterType = new EncounterType();
    encounter.encounterType.name = "Foo";
    assert.equal("Foo", _.get(encounter, "encounterType.name"));
  });

  it('should delete the right object', function () {
    const stubbedRealmDb = new StubbedRealmDb();
    const realmProxy = new RealmProxy(stubbedRealmDb, EntityMappingConfig.getInstance());
    const underlyingObject = {};

    let passedObject = RealmResultsProxy.create(underlyingObject, PersistedObject);
    realmProxy.delete(passedObject);
    assert.equal(underlyingObject, stubbedRealmDb.deletedObject);

    passedObject = new RealmListProxy(underlyingObject);
    realmProxy.delete(passedObject);
    assert.equal(underlyingObject, stubbedRealmDb.deletedObject);

    passedObject = new PersistedObject(underlyingObject);
    realmProxy.delete(passedObject);
    assert.equal(underlyingObject, stubbedRealmDb.deletedObject);

    passedObject = [new PersistedObject(underlyingObject)];
    realmProxy.delete(passedObject);
    assert.equal(underlyingObject, stubbedRealmDb.deletedObject[0]);

    passedObject = {};
    realmProxy.delete(passedObject);
    assert.equal(passedObject, stubbedRealmDb.deletedObject);
  });

  describe('RealmProxy.create', () => {
    let stubbedRealmDb;
    let realmProxy;

    beforeEach(() => {
      stubbedRealmDb = new StubbedRealmDb();
      realmProxy = new RealmProxy(stubbedRealmDb, EntityMappingConfig.getInstance());
    });

    it('should create entity with all required fields', () => {
      const settings = new Settings();
      settings.uuid = Settings.UUID;
      settings.serverURL = "http://example.com";
      settings.logLevel = 1;
      settings.pageSize = 20;
      settings.poolId = "pool1";
      settings.clientId = "client1";
      settings.devSkipValidation = false;
      settings.captureLocation = true;
      
      const result = realmProxy.create(Settings.schema.name, settings);
      
      assert.isNotNull(result);
      assert.equal(result.uuid, Settings.UUID);
      // createdEntity is now the raw processed object
      assert.equal(stubbedRealmDb.createdEntity.uuid, Settings.UUID);
    });

    it('should create entity with updateMode "never" when all mandatory fields present', () => {
      const settings = new Settings();
      settings.uuid = Settings.UUID;
      settings.serverURL = "http://example.com";
      settings.logLevel = 1;
      settings.pageSize = 20;
      settings.poolId = "pool1";
      settings.clientId = "client1";
      settings.devSkipValidation = false;
      settings.captureLocation = true;
      
      const result = realmProxy.create(Settings.schema.name, settings, "never");
      
      assert.isNotNull(result);
      // createdEntity is now the raw processed object
      assert.equal(stubbedRealmDb.createdEntity.uuid, Settings.UUID);
      assert.equal(stubbedRealmDb.createUpdateMode, "never");
    });

    it('should create entity with updateMode "all" even with missing mandatory fields', () => {
      const incompleteSettings = new Settings();
      // Don't set UUID
      
      // Should not throw error with updateMode "all"
      const result = realmProxy.create(Settings.schema.name, incompleteSettings, "all");
      
      assert.isNotNull(result);
      // createdEntity is now the raw processed object
      assert.isDefined(stubbedRealmDb.createdEntity);
      assert.equal(stubbedRealmDb.createUpdateMode, "all");
    });

    it('should create entity with updateMode true (modified)', () => {
      const settings = new Settings();
      settings.uuid = Settings.UUID;
      settings.serverURL = "http://example.com";
      settings.logLevel = 1;
      settings.pageSize = 20;
      settings.poolId = "pool1";
      settings.clientId = "client1";
      settings.devSkipValidation = false;
      settings.captureLocation = true;
      
      const result = realmProxy.create(Settings.schema.name, settings, true);
      
      assert.isNotNull(result);
      // createdEntity is now the raw processed object
      assert.equal(stubbedRealmDb.createdEntity.uuid, Settings.UUID);
      assert.equal(stubbedRealmDb.createUpdateMode, true);
    });

    it('should create entity with updateMode false (never)', () => {
      const settings = new Settings();
      settings.uuid = Settings.UUID;
      settings.serverURL = "http://example.com";
      settings.logLevel = 1;
      settings.pageSize = 20;
      settings.poolId = "pool1";
      settings.clientId = "client1";
      settings.devSkipValidation = false;
      settings.captureLocation = true;
      
      const result = realmProxy.create(Settings.schema.name, settings, false);
      
      assert.isNotNull(result);
      // createdEntity is now the raw processed object
      assert.equal(stubbedRealmDb.createdEntity.uuid, Settings.UUID);
      assert.equal(stubbedRealmDb.createUpdateMode, false);
    });

    it('should create entity when optional properties are missing', () => {
      const settings = new Settings();
      settings.uuid = Settings.UUID;
      settings.serverURL = "http://example.com";
      settings.logLevel = 1;
      settings.pageSize = 20;
      settings.poolId = "pool1";
      settings.clientId = "client1";
      settings.devSkipValidation = false;
      settings.captureLocation = true;
      // Don't set optional properties
      
      const result = realmProxy.create(Settings.schema.name, settings);
      
      assert.isNotNull(result);
      assert.equal(result.uuid, Settings.UUID);
    });

    // NOTE: The following tests document current behavior after embedded object changes
    // The validation logic appears to have issues after the embedded object processing changes
    
    it('should validate missing mandatory properties', () => {
      // This test validates that missing mandatory properties are caught when in strict update mode
      // Note: Properties with default values (devSkipValidation, captureLocation) are not mandatory
      const incompleteSettings = new Settings();
      incompleteSettings.uuid = "test-uuid"; // Only UUID set, missing other mandatory properties
      
      // Use updateMode "never" to trigger strict validation
      assert.throws(() => {
        realmProxy.create(Settings.schema.name, incompleteSettings, "never");
      }, /serverURL,logLevel,pageSize,poolId,clientId are mandatory for Settings/);
    });

    it('should validate null mandatory properties', () => {
      // This test validates that null mandatory properties are caught
      const incompleteSettings = new Settings();
      incompleteSettings.uuid = "test-uuid";
      incompleteSettings.serverURL = "http://example.com";
      incompleteSettings.logLevel = 1;
      incompleteSettings.pageSize = 20;
      incompleteSettings.poolId = "pool1";
      incompleteSettings.clientId = "client1";
      incompleteSettings.devSkipValidation = false;
      incompleteSettings.captureLocation = true;
      incompleteSettings.serverURL = null; // Set serverURL to null to trigger validation
      
      assert.throws(() => {
        realmProxy.create(Settings.schema.name, incompleteSettings);
      }, /serverURL are mandatory for Settings/);
    });

    it('should allow empty objects with updateMode "all"', () => {
      // This test ensures that updateMode "all" bypasses validation completely
      const emptySettings = new Settings();
      // Don't set any properties
      
      // Should not throw error with updateMode "all"
      const result = realmProxy.create(Settings.schema.name, emptySettings, "all");
      
      assert.isNotNull(result);
      // createdEntity is now the raw processed object
      assert.isDefined(stubbedRealmDb.createdEntity);
      assert.equal(stubbedRealmDb.createUpdateMode, "all");
    });

    it('should process embedded objects before creation', () => {
      // Create a test entity with embedded objects - using a simpler approach
      class TestEmbeddedEntity {
        constructor(data) {
          this.that = data || {};
        }
        
        static get schema() {
          return {
            name: "TestEmbeddedEntity",
            properties: {
              uuid: "string",
              name: { type: "string", optional: true }, // Make optional to avoid validation issues
              embeddedField: { type: "object", objectType: "EmbeddedType", optional: true }
            }
          };
        }
      }

      // Mock the entity mapping to return our test class
      const originalGetEntityClass = EntityMappingConfig.getInstance().getEntityClass;
      EntityMappingConfig.getInstance().getEntityClass = (schemaName) => {
        if (schemaName === "TestEmbeddedEntity") return TestEmbeddedEntity;
        return originalGetEntityClass.call(EntityMappingConfig.getInstance(), schemaName);
      };

      const entityData = {
        uuid: "test-uuid",
        name: "test-entity",
        embeddedField: { property1: "value1" }
      };
      
      const result = realmProxy.create("TestEmbeddedEntity", new TestEmbeddedEntity(entityData));
      
      assert.isNotNull(result);
      // Verify the embedded object was processed (copied)
      assert.equal(stubbedRealmDb.createdEntity.uuid, "test-uuid");
      assert.equal(stubbedRealmDb.createdEntity.name, "test-entity");
      assert.equal(stubbedRealmDb.createdEntity.embeddedField.property1, "value1");

      // Restore original method
      EntityMappingConfig.getInstance().getEntityClass = originalGetEntityClass;
    });

    it('should handle embedded object lists before creation', () => {
      // Create a test entity with embedded object lists
      class TestListEntity {
        constructor(data) {
          this.that = data || {};
        }
        
        static get schema() {
          return {
            name: "TestListEntity",
            properties: {
              uuid: "string",
              items: { type: "list", objectType: "ItemType", optional: true }
            }
          };
        }
      }

      const originalGetEntityClass = EntityMappingConfig.getInstance().getEntityClass;
      EntityMappingConfig.getInstance().getEntityClass = (schemaName) => {
        if (schemaName === "TestListEntity") return TestListEntity;
        return originalGetEntityClass.call(EntityMappingConfig.getInstance(), schemaName);
      };

      const entityData = {
        uuid: "test-uuid",
        items: [
          { id: "item-1", name: "Item 1" },
          { id: "item-2", name: "Item 2" }
        ]
      };
      
      const result = realmProxy.create("TestListEntity", new TestListEntity(entityData));
      
      assert.isNotNull(result);
      assert.equal(stubbedRealmDb.createdEntity.uuid, "test-uuid");
      assert.isArray(stubbedRealmDb.createdEntity.items);
      assert.equal(stubbedRealmDb.createdEntity.items.length, 2);
      assert.equal(stubbedRealmDb.createdEntity.items[0].id, "item-1");
      assert.equal(stubbedRealmDb.createdEntity.items[1].name, "Item 2");

      // Restore original method
      EntityMappingConfig.getInstance().getEntityClass = originalGetEntityClass;
    });

    it('should preserve null values for optional embedded objects', () => {
      // Create a test entity with optional embedded objects
      class TestOptionalEntity {
        constructor(data) {
          this.that = data || {};
        }
        
        static get schema() {
          return {
            name: "TestOptionalEntity",
            properties: {
              uuid: "string",
              optionalEmbedded: { type: "object", objectType: "OptionalType", optional: true }
            }
          };
        }
      }

      const originalGetEntityClass = EntityMappingConfig.getInstance().getEntityClass;
      EntityMappingConfig.getInstance().getEntityClass = (schemaName) => {
        if (schemaName === "TestOptionalEntity") return TestOptionalEntity;
        return originalGetEntityClass.call(EntityMappingConfig.getInstance(), schemaName);
      };

      const entityData = {
        uuid: "test-uuid",
        optionalEmbedded: null
      };
      
      const result = realmProxy.create("TestOptionalEntity", new TestOptionalEntity(entityData));
      
      assert.isNotNull(result);
      assert.equal(stubbedRealmDb.createdEntity.uuid, "test-uuid");
      assert.isNull(stubbedRealmDb.createdEntity.optionalEmbedded);

      // Restore original method
      EntityMappingConfig.getInstance().getEntityClass = originalGetEntityClass;
    });

    it('should handle complex nested embedded objects', () => {
      // Create a test entity with deeply nested embedded objects
      class TestNestedEntity {
        constructor(data) {
          this.that = data || {};
        }
        
        static get schema() {
          return {
            name: "TestNestedEntity",
            properties: {
              uuid: "string",
              level1: { type: "object", objectType: "Level1Type", optional: true }
            }
          };
        }
      }

      const originalGetEntityClass = EntityMappingConfig.getInstance().getEntityClass;
      EntityMappingConfig.getInstance().getEntityClass = (schemaName) => {
        if (schemaName === "TestNestedEntity") return TestNestedEntity;
        return originalGetEntityClass.call(EntityMappingConfig.getInstance(), schemaName);
      };

      const entityData = {
        uuid: "test-uuid",
        level1: {
          name: "Level 1",
          level2: {
            name: "Level 2",
            value: "nested value"
          }
        }
      };
      
      const result = realmProxy.create("TestNestedEntity", new TestNestedEntity(entityData));
      
      assert.isNotNull(result);
      assert.equal(stubbedRealmDb.createdEntity.uuid, "test-uuid");
      assert.equal(stubbedRealmDb.createdEntity.level1.name, "Level 1");
      assert.equal(stubbedRealmDb.createdEntity.level1.level2.name, "Level 2");
      assert.equal(stubbedRealmDb.createdEntity.level1.level2.value, "nested value");

      // Restore original method
      EntityMappingConfig.getInstance().getEntityClass = originalGetEntityClass;
    });
  });
});
