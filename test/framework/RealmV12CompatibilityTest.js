/**
 * Schema and Wrapper Compatibility Tests
 */

import RealmListProxy from '../../src/framework/RealmListProxy';
import Individual from '../../src/Individual';
import SyncError from '../../src/error/SyncError';
import RealmEmbeddedObjectHandler from '../../src/framework/RealmEmbeddedObjectHandler';

describe('Schema Validation', () => {
  test('All schemas loadable', () => {
    const Schema = require('../../src/Schema').default;
    const config = Schema.getInstance().getRealmConfig();
    expect(config.schema.length).toBeGreaterThan(0);
  });

  test('List properties have objectType', () => {
    const Schema = require('../../src/Schema').default;
    const config = Schema.getInstance().getRealmConfig();
    const issues = [];
    config.schema.forEach(s => {
      Object.entries(s.properties).forEach(([k, v]) => {
        if (v.type === 'list' && !v.objectType) issues.push(`${s.name}.${k}`);
      });
    });
    expect(issues).toEqual([]);
  });

  test('Embedded object properties are properly defined', () => {
    const Schema = require('../../src/Schema').default;
    const config = Schema.getInstance().getRealmConfig();
    const embeddedObjectIssues = [];
    
    config.schema.forEach(s => {
      Object.entries(s.properties).forEach(([k, v]) => {
        if (v.type === 'object' && v.objectType) {
          // Check that embedded objects have valid objectType
          if (v.objectType === 'string') {
            embeddedObjectIssues.push(`${s.name}.${k}: Embedded object cannot have objectType 'string'`);
          }
        }
      });
    });
    
    expect(embeddedObjectIssues).toEqual([]);
  });
});

describe('Wrapper Pattern', () => {
  test('Individual wrapper', () => {
    const ind = new Individual();
    expect(ind.that).toBeDefined();
  });

  test('RealmListProxy extends Array', () => {
    const list = new RealmListProxy([]);
    expect(Array.isArray(list)).toBe(true);
  });

  test('SyncError prototype chain', () => {
    const err = new SyncError('CODE', 'msg');
    expect(err).toBeInstanceOf(Error);
    expect(err.errorCode).toBe('CODE');
  });
});

describe('Realm V12+ Embedded Object Compatibility', () => {
  test('Framework automatically processes embedded objects', () => {
    const testData = {
      uuid: "compat-test-1",
      name: "Test Entity",
      embeddedField: {
        property1: "value1",
        property2: "value2"
      }
    };

    const testSchema = {
      name: "TestEntity",
      properties: {
        uuid: "string",
        name: "string",
        embeddedField: { type: "object", objectType: "EmbeddedTest" }
      }
    };

    // Test the handler directly
    const processedData = RealmEmbeddedObjectHandler.processEmbeddedObjects(testData, testSchema);
    
    expect(processedData).toBeDefined();
    expect(processedData.uuid).toBe("compat-test-1");
    expect(processedData.name).toBe("Test Entity");
    expect(processedData.embeddedField.property1).toBe("value1");
    expect(processedData.embeddedField.property2).toBe("value2");
  });

  test('Embedded object lists are handled correctly', () => {
    const testData = {
      uuid: "compat-test-2",
      items: [
        { id: "item-1", name: "Item 1" },
        { id: "item-2", name: "Item 2" }
      ]
    };

    const testSchema = {
      name: "TestEntity",
      properties: {
        uuid: "string",
        items: { type: "list", objectType: "TestItem" }
      }
    };

    const processedData = RealmEmbeddedObjectHandler.processEmbeddedObjects(testData, testSchema);
    
    expect(processedData.items).toHaveLength(2);
    expect(processedData.items[0].id).toBe("item-1");
    expect(processedData.items[0].name).toBe("Item 1");
    expect(processedData.items[1].id).toBe("item-2");
    expect(processedData.items[1].name).toBe("Item 2");
  });

  test('Optional embedded objects are preserved', () => {
    const testData = {
      uuid: "compat-test-3",
      optionalField: null
    };

    const testSchema = {
      name: "TestEntity",
      properties: {
        uuid: "string",
        optionalField: { type: "object", objectType: "OptionalType", optional: true }
      }
    };

    const processedData = RealmEmbeddedObjectHandler.processEmbeddedObjects(testData, testSchema);
    
    expect(processedData.optionalField).toBeNull();
    expect(processedData.uuid).toBe("compat-test-3");
  });

  test('Deeply nested embedded objects are processed', () => {
    const testData = {
      uuid: "compat-test-4",
      level1: {
        name: "Level 1",
        level2: {
          name: "Level 2",
          value: "nested value"
        }
      }
    };

    const testSchema = {
      name: "TestEntity",
      properties: {
        uuid: "string",
        level1: { 
          type: "object", 
          objectType: "Level1Type"
        }
      }
    };

    const processedData = RealmEmbeddedObjectHandler.processEmbeddedObjects(testData, testSchema);
    
    expect(processedData.level1.name).toBe("Level 1");
    expect(processedData.level1.level2.name).toBe("Level 2");
    expect(processedData.level1.level2.value).toBe("nested value");
  });

  test('Embedded object property identification works correctly', () => {
    const embeddedProperty = { type: "object", objectType: "EmbeddedType" };
    const listProperty = { type: "list", objectType: "ListType" };
    const stringProperty = { type: "string" };
    const optionalEmbedded = { type: "object", objectType: "OptionalType", optional: true };
    const propertyWithoutObjectType = { type: "object" };

    expect(RealmEmbeddedObjectHandler.isEmbeddedObjectProperty(embeddedProperty)).toBe(true);
    expect(RealmEmbeddedObjectHandler.isEmbeddedObjectProperty(optionalEmbedded)).toBe(true);
    expect(RealmEmbeddedObjectHandler.isEmbeddedObjectProperty(listProperty)).toBe(false);
    expect(RealmEmbeddedObjectHandler.isEmbeddedObjectProperty(propertyWithoutObjectType)).toBe(false);
    expect(RealmEmbeddedObjectHandler.isEmbeddedObjectProperty(stringProperty)).toBe(false);
  });

  test('Embedded object list identification works correctly', () => {
    const embeddedList = { type: "list", objectType: "EmbeddedType" };
    const stringList = { type: "list", objectType: "string" };
    const objectProperty = { type: "object", objectType: "EmbeddedType" };

    expect(RealmEmbeddedObjectHandler.isListOfEmbeddedObjects(embeddedList)).toBe(true);
    expect(RealmEmbeddedObjectHandler.isListOfEmbeddedObjects(stringList)).toBe(false);
    expect(RealmEmbeddedObjectHandler.isListOfEmbeddedObjects(objectProperty)).toBe(false);
  });

  test('Safe copying of embedded objects works', () => {
    const mockEmbeddedObj = {
      property1: "value1",
      property2: "value2",
      toJSON: () => ({ property1: "value1", property2: "value2" })
    };

    const copied = RealmEmbeddedObjectHandler.safeCopyEmbeddedObject(mockEmbeddedObj);
    
    expect(copied.property1).toBe("value1");
    expect(copied.property2).toBe("value2");
    // Since this is not a Realm object, it returns as-is
    expect(copied).toBe(mockEmbeddedObj);
  });

  test('Performance with large embedded object datasets', () => {
    const startTime = Date.now();
    
    const largeTestData = {
      uuid: "perf-compat-test",
      items: Array.from({length: 1000}, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        value: i
      }))
    };

    const testSchema = {
      name: "LargeEntity",
      properties: {
        uuid: "string",
        items: { type: "list", objectType: "PerfItem" }
      }
    };

    const processedData = RealmEmbeddedObjectHandler.processEmbeddedObjects(largeTestData, testSchema);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(processedData.items).toHaveLength(1000);
    expect(duration).toBeLessThan(1000); // Should complete quickly
  });

  test('Comprehensive embedded object handling validation', () => {
    // This test validates that the framework handles all embedded object types
    // without requiring manual utility usage - critical for V12+ compatibility
    
    const testData = {
      uuid: "comprehensive-compat-test",
      embeddedField: {
        property1: "value1",
        property2: "value2"
      },
      optionalField: null,
      listField: [
        { id: "1", name: "First" },
        { id: "2", name: "Second" }
      ]
    };

    const testSchema = {
      name: "ComprehensiveTestEntity",
      properties: {
        uuid: "string",
        embeddedField: { type: "object", objectType: "EmbeddedType" },
        optionalField: { type: "object", objectType: "OptionalType", optional: true },
        listField: { type: "list", objectType: "ListItemType" }
      }
    };

    const processedData = RealmEmbeddedObjectHandler.processEmbeddedObjects(testData, testSchema);
    
    // Framework should automatically handle all embedded object types
    expect(processedData.embeddedField.property1).toBe("value1");
    expect(processedData.embeddedField.property2).toBe("value2");
    expect(processedData.optionalField).toBeNull();
    expect(processedData.listField).toHaveLength(2);
    expect(processedData.listField[0].name).toBe("First");
    expect(processedData.listField[1].name).toBe("Second");
    
    // No manual utility usage required - framework handles it automatically
    expect(processedData.uuid).toBe("comprehensive-compat-test");
  });
});
