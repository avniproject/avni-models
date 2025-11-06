import EntityMappingConfig from "../../src/Schema";
import RealmProxy from "../../src/framework/RealmProxy";
import Settings from "../../src/Settings";
import BaseEntity from "../../src/BaseEntity";
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

    it('should create entity with updateMode "all" when not touching mandatory fields', () => {
      const incompleteSettings = new Settings();
      // Don't set any properties - not touching mandatory fields
      // This is allowed with updateMode "all" because we're not explicitly setting mandatory fields to null
      
      const result = realmProxy.create(Settings.schema.name, incompleteSettings, "all");
      
      assert.isNotNull(result);
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

    // Validation tests for mandatory properties
    // These tests ensure we catch real production issues with clear error messages
    
    it('should validate missing mandatory property with UUID in error', () => {
      // Simulates: Error privilege are mandatory for GroupPrivileges... UUID: 4d9d7895-3610-40a0-af4a-c1c473d3d7b6
      const MockEntity = class extends BaseEntity {
        static schema = {
          name: "GroupPrivileges",
          primaryKey: "uuid",
          properties: {
            uuid: "string",
            group: "string",
            privilege: "string",  // mandatory
            allow: "bool"
          }
        };
      };
      
      const originalGetEntityClass = realmProxy.entityMappingConfig.getEntityClass;
      const originalGetMandatory = realmProxy.entityMappingConfig.getMandatoryObjectSchemaProperties;
      
      realmProxy.entityMappingConfig.getEntityClass = (schemaName) => {
        if (schemaName === "GroupPrivileges") return MockEntity;
        return originalGetEntityClass.call(realmProxy.entityMappingConfig, schemaName);
      };
      
      realmProxy.entityMappingConfig.getMandatoryObjectSchemaProperties = (schemaName) => {
        if (schemaName === "GroupPrivileges") return ["uuid", "group", "privilege"];
        return originalGetMandatory.call(realmProxy.entityMappingConfig, schemaName);
      };
      
      try {
        // Create entity with null mandatory property
        const entityData = {
          uuid: "4d9d7895-3610-40a0-af4a-c1c473d3d7b6",
          group: "test-group",
          privilege: null,  // null mandatory property
          allow: true
        };
        const incompleteEntity = new MockEntity(entityData);
        
        assert.throws(() => {
          realmProxy.create("GroupPrivileges", incompleteEntity, "never");
        }, /privilege are mandatory for GroupPrivileges.*UUID: 4d9d7895-3610-40a0-af4a-c1c473d3d7b6/);
      } finally {
        realmProxy.entityMappingConfig.getEntityClass = originalGetEntityClass;
        realmProxy.entityMappingConfig.getMandatoryObjectSchemaProperties = originalGetMandatory;
      }
    });

    it('should validate multiple missing mandatory properties', () => {
      // Simulates: Error lowestAddressLevel,subjectType are mandatory for Individual
      const MockEntity = class extends BaseEntity {
        static schema = {
          name: "Individual",
          primaryKey: "uuid",
          properties: {
            uuid: "string",
            firstName: "string",
            lowestAddressLevel: "string",  // mandatory
            subjectType: "string"  // mandatory
          }
        };
      };
      
      const originalGetEntityClass = realmProxy.entityMappingConfig.getEntityClass;
      const originalGetMandatory = realmProxy.entityMappingConfig.getMandatoryObjectSchemaProperties;
      
      realmProxy.entityMappingConfig.getEntityClass = (schemaName) => {
        if (schemaName === "Individual") return MockEntity;
        return originalGetEntityClass.call(realmProxy.entityMappingConfig, schemaName);
      };
      
      realmProxy.entityMappingConfig.getMandatoryObjectSchemaProperties = (schemaName) => {
        if (schemaName === "Individual") return ["uuid", "firstName", "lowestAddressLevel", "subjectType"];
        return originalGetMandatory.call(realmProxy.entityMappingConfig, schemaName);
      };
      
      try {
        // Create entity with multiple null mandatory properties
        const entityData = {
          uuid: "491770df-4046-4430-a846-26b7d4789128",
          firstName: "Test",
          lowestAddressLevel: null,  // null
          subjectType: null  // null
        };
        const incompleteEntity = new MockEntity(entityData);
        
        assert.throws(() => {
          realmProxy.create("Individual", incompleteEntity, "never");
        }, /lowestAddressLevel,subjectType are mandatory for Individual/);
      } finally {
        realmProxy.entityMappingConfig.getEntityClass = originalGetEntityClass;
        realmProxy.entityMappingConfig.getMandatoryObjectSchemaProperties = originalGetMandatory;
      }
    });

    it('should validate missing relationship property', () => {
      // Simulates: Error individualB are mandatory for IndividualRelationship
      const MockEntity = class extends BaseEntity {
        static schema = {
          name: "IndividualRelationship",
          primaryKey: "uuid",
          properties: {
            uuid: "string",
            relationship: "string",
            individualA: "string",
            individualB: "string"  // mandatory relationship
          }
        };
      };
      
      const originalGetEntityClass = realmProxy.entityMappingConfig.getEntityClass;
      const originalGetMandatory = realmProxy.entityMappingConfig.getMandatoryObjectSchemaProperties;
      
      realmProxy.entityMappingConfig.getEntityClass = (schemaName) => {
        if (schemaName === "IndividualRelationship") return MockEntity;
        return originalGetEntityClass.call(realmProxy.entityMappingConfig, schemaName);
      };
      
      realmProxy.entityMappingConfig.getMandatoryObjectSchemaProperties = (schemaName) => {
        if (schemaName === "IndividualRelationship") return ["uuid", "relationship", "individualA", "individualB"];
        return originalGetMandatory.call(realmProxy.entityMappingConfig, schemaName);
      };
      
      try {
        // Create entity with undefined mandatory relationship
        const entityData = {
          uuid: "e649fe3e-723b-4836-bf2c-963569608cd2",
          relationship: "test-relationship",
          individualA: "person-a",
          individualB: undefined  // undefined mandatory relationship
        };
        const incompleteEntity = new MockEntity(entityData);
        
        assert.throws(() => {
          realmProxy.create("IndividualRelationship", incompleteEntity, "never");
        }, /individualB are mandatory for IndividualRelationship.*UUID: e649fe3e-723b-4836-bf2c-963569608cd2/);
      } finally {
        realmProxy.entityMappingConfig.getEntityClass = originalGetEntityClass;
        realmProxy.entityMappingConfig.getMandatoryObjectSchemaProperties = originalGetMandatory;
      }
    });

    it('should validate mandatory properties when touched, regardless of update mode', () => {
      // Validation triggers when touching mandatory properties to prevent data corruption
      const MockEntity = class extends BaseEntity {
        static schema = {
          name: "TestEntity",
          primaryKey: "uuid",
          properties: {
            uuid: "string",
            mandatoryField: "string",
            optionalField: { type: "string", optional: true }
          }
        };
      };
      
      const originalGetEntityClass = realmProxy.entityMappingConfig.getEntityClass;
      const originalGetMandatory = realmProxy.entityMappingConfig.getMandatoryObjectSchemaProperties;
      
      realmProxy.entityMappingConfig.getEntityClass = (schemaName) => {
        if (schemaName === "TestEntity") return MockEntity;
        return originalGetEntityClass.call(realmProxy.entityMappingConfig, schemaName);
      };
      
      realmProxy.entityMappingConfig.getMandatoryObjectSchemaProperties = (schemaName) => {
        if (schemaName === "TestEntity") return ["uuid", "mandatoryField"];
        return originalGetMandatory.call(realmProxy.entityMappingConfig, schemaName);
      };
      
      try {
        // Should throw with updateMode "never" when mandatory field is null
        const entityDataNull = {
          uuid: "test-uuid",
          mandatoryField: null
        };
        const entityNull = new MockEntity(entityDataNull);
        
        assert.throws(() => {
          realmProxy.create("TestEntity", entityNull, "never");
        }, /mandatoryField are mandatory for TestEntity/);
        
        // Should also throw with updateMode false
        assert.throws(() => {
          realmProxy.create("TestEntity", entityNull, false);
        }, /mandatoryField are mandatory for TestEntity/);
        
        // Should ALSO throw with updateMode "all" when touching mandatory field with null
        // This prevents data corruption
        assert.throws(() => {
          realmProxy.create("TestEntity", entityNull, "all");
        }, /mandatoryField are mandatory for TestEntity/);
        
        // Should NOT throw with updateMode "all" when NOT touching mandatory fields
        const entityOptional = new MockEntity({
          uuid: "test-uuid-2",
          optionalField: "some value"
        });
        
        assert.doesNotThrow(() => {
          realmProxy.create("TestEntity", entityOptional, "all");
        });
      } finally {
        realmProxy.entityMappingConfig.getEntityClass = originalGetEntityClass;
        realmProxy.entityMappingConfig.getMandatoryObjectSchemaProperties = originalGetMandatory;
      }
    });

    it('should validate nested object processing', () => {
      // Test that the framework properly processes nested objects without breaking validation
      // This validates the RealmNestedObjectHandler integration
      
      const MockEntity = class extends BaseEntity {
        static schema = {
          name: "MockEntity",
          primaryKey: "uuid",
          properties: {
            uuid: "string",
            name: "string",
            nestedObject: { type: "object", objectType: "MockNestedEntity" }
          },
        };
      };

      const MockNestedEntity = class extends BaseEntity {
        static schema = {
          name: "MockNestedEntity", 
          primaryKey: "uuid",
          properties: {
            uuid: "string",
            value: "string"
          },
        };
      };
      
      // Store original getEntityClass
      const originalGetEntityClass = realmProxy.entityMappingConfig.getEntityClass;
      
      // Register mock entities for testing
      realmProxy.entityMappingConfig.getEntityClass = (schemaName) => {
        if (schemaName === "MockEntity") return MockEntity;
        if (schemaName === "MockNestedEntity") return MockNestedEntity;
        return originalGetEntityClass.call(realmProxy.entityMappingConfig, schemaName);
      };
      
      try {
        // Test nested object creation works
        const testObject = new MockEntity();
        testObject.uuid = "test-uuid";
        testObject.name = "test-name";
        testObject.nestedObject = {
          uuid: "nested-uuid", 
          value: "nested-value"
        };
        
        assert.doesNotThrow(() => {
          realmProxy.create("MockEntity", testObject, "never");
        });
      } finally {
        // Restore original getEntityClass
        realmProxy.entityMappingConfig.getEntityClass = originalGetEntityClass;
      }
    });

    it('should allow empty objects with updateMode "all" when not touching mandatory fields', () => {
      // updateMode "all" allows updates without touching mandatory fields
      // Validation only triggers if we explicitly set mandatory fields to null
      const emptySettings = new Settings();
      // Don't set any properties - not touching mandatory fields
      
      const result = realmProxy.create(Settings.schema.name, emptySettings, "all");
      
      assert.isNotNull(result);
      assert.isDefined(stubbedRealmDb.createdEntity);
      assert.equal(stubbedRealmDb.createUpdateMode, "all");
    });

    it('should process nested objects before creation', () => {
      // Create a test entity with nested objects - using a simpler approach
      class TestNestedEntity {
        constructor(data) {
          this.that = data || {};
        }
        
        static get schema() {
          return {
            name: "TestNestedEntity",
            properties: {
              uuid: "string",
              name: { type: "string", optional: true }, // Make optional to avoid validation issues
              nestedField: { type: "object", objectType: "NestedType", optional: true }
            }
          };
        }
      }

      // Mock the entity mapping to return our test class
      const originalGetEntityClass = EntityMappingConfig.getInstance().getEntityClass;
      EntityMappingConfig.getInstance().getEntityClass = (schemaName) => {
        if (schemaName === "TestNestedEntity") return TestNestedEntity;
        return originalGetEntityClass.call(EntityMappingConfig.getInstance(), schemaName);
      };

      const entityData = {
        uuid: "test-uuid",
        name: "test-entity",
        nestedField: { property1: "value1" }
      };
      
      const result = realmProxy.create("TestNestedEntity", new TestNestedEntity(entityData));
      
      assert.isNotNull(result);
      // Verify the nested object was processed (copied)
      assert.equal(stubbedRealmDb.createdEntity.uuid, "test-uuid");
      assert.equal(stubbedRealmDb.createdEntity.name, "test-entity");
      assert.equal(stubbedRealmDb.createdEntity.nestedField.property1, "value1");

      // Restore original method
      EntityMappingConfig.getInstance().getEntityClass = originalGetEntityClass;
    });

    it('should handle nested object lists before creation', () => {
      // Create a test entity with nested object lists
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

    it('should preserve null values for optional nested objects', () => {
      // Create a test entity with optional nested objects
      class TestOptionalEntity {
        constructor(data) {
          this.that = data || {};
        }
        
        static get schema() {
          return {
            name: "TestOptionalEntity",
            properties: {
              uuid: "string",
              optionalNested: { type: "object", objectType: "OptionalType", optional: true }
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
        optionalNested: null
      };
      
      const result = realmProxy.create("TestOptionalEntity", new TestOptionalEntity(entityData));
      
      assert.isNotNull(result);
      assert.equal(stubbedRealmDb.createdEntity.uuid, "test-uuid");
      assert.isNull(stubbedRealmDb.createdEntity.optionalNested);

      // Restore original method
      EntityMappingConfig.getInstance().getEntityClass = originalGetEntityClass;
    });

    it('should handle complex nested objects', () => {
      // Create a test entity with deeply nested objects
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
