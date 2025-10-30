import General from "../utility/General";

/**
 * Utility class providing safe patterns for handling embedded objects in Realm 12+
 * 
 * This addresses the issue where embedded object references become invalidated 
 * during write transactions when upgrading from Realm 11.10.2 to 12.14.2.
 */
class RealmEmbeddedObjectUtils {
    
    /**
     * Safely copies an embedded object to a plain JavaScript object
     * This is the recommended approach for reusing embedded object data
     * 
     * @param {Object} embeddedObj - The embedded object to copy
     * @param {Array} properties - Array of property names to copy (optional)
     * @returns {Object} Plain JavaScript object with copied properties
     */
    static deepCopyEmbeddedObject(embeddedObj, properties = null) {
        if (!embeddedObj) {
            return null;
        }
        
        const plainCopy = {};
        
        if (properties && Array.isArray(properties)) {
            // Copy only specified properties
            properties.forEach(prop => {
                if (embeddedObj[prop] !== undefined) {
                    plainCopy[prop] = embeddedObj[prop];
                }
            });
        } else {
            // Copy all properties - handle both Realm and plain objects
            try {
                // Try to get schema first (Realm objects)
                if (embeddedObj.objectSchema && typeof embeddedObj.objectSchema === 'function') {
                    const schema = embeddedObj.objectSchema();
                    if (schema && schema.properties) {
                        Object.keys(schema.properties).forEach(prop => {
                            plainCopy[prop] = embeddedObj[prop];
                        });
                    }
                } else if (embeddedObj.objectSchema && embeddedObj.objectSchema.properties) {
                    // Direct schema access
                    Object.keys(embeddedObj.objectSchema.properties).forEach(prop => {
                        plainCopy[prop] = embeddedObj[prop];
                    });
                } else {
                    // Fallback: copy all enumerable properties
                    Object.keys(embeddedObj).forEach(prop => {
                        if (typeof embeddedObj[prop] !== 'function') {
                            plainCopy[prop] = embeddedObj[prop];
                        }
                    });
                }
            } catch (error) {
                // Fallback for any schema access errors
                Object.keys(embeddedObj).forEach(prop => {
                    if (typeof embeddedObj[prop] !== 'function') {
                        plainCopy[prop] = embeddedObj[prop];
                    }
                });
            }
        }
        
        return plainCopy;
    }
    
    /**
     * Uses toJSON() method to convert embedded object to plain object
     * Convenient alternative to deep copy
     * 
     * @param {Object} embeddedObj - The embedded object to convert
     * @returns {Object} Plain JavaScript object or null
     */
    static toJSONCopy(embeddedObj) {
        if (!embeddedObj) {
            return null;
        }
        
        try {
            return embeddedObj.toJSON();
        } catch (error) {
            General.logError("RealmEmbeddedObjectUtils", `toJSON conversion failed: ${error.message}`);
            return this.deepCopyEmbeddedObject(embeddedObj);
        }
    }
    
    /**
     * Gets a fresh managed reference to an embedded object
     * Useful when you need to modify the embedded object
     * 
     * @param {Realm} realm - The Realm instance
     * @param {string} parentSchemaName - Name of the parent object schema
     * @param {string} parentPrimaryKey - Primary key value of the parent
     * @param {string} embeddedPropertyName - Name of the embedded property
     * @returns {Object} Managed embedded object reference
     */
    static getFreshManagedReference(realm, parentSchemaName, parentPrimaryKey, embeddedPropertyName) {
        const parent = realm.objectForPrimaryKey(parentSchemaName, parentPrimaryKey);
        if (!parent) {
            return null;
        }
        
        return parent[embeddedPropertyName];
    }
    
    /**
     * Safely creates an object with embedded object reference
     * Uses deep copy approach to avoid unmanaged object issues
     * 
     * @param {Realm} realm - The Realm instance
     * @param {string} targetSchemaName - Name of the schema for the object to create
     * @param {Object} data - Data object containing the embedded object reference
     * @param {string} embeddedPropertyName - Name of the property that contains the embedded object
     * @param {boolean} update - Whether to update if object exists (default: false)
     * @returns {Object} The created Realm object
     */
    static safeCreateWithEmbeddedReference(realm, targetSchemaName, data, embeddedPropertyName, update = false) {
        const dataToCreate = {...data};
        
        if (dataToCreate[embeddedPropertyName]) {
            dataToCreate[embeddedPropertyName] = this.deepCopyEmbeddedObject(dataToCreate[embeddedPropertyName]);
        }
        
        return realm.create(targetSchemaName, dataToCreate, update);
    }
    
    /**
     * Batch operation for creating multiple objects with embedded references safely
     * 
     * @param {Realm} realm - The Realm instance
     * @param {Array} operations - Array of operation objects with schema, data, and embeddedProperty
     */
    static batchCreateWithEmbeddedReferences(realm, operations) {
        operations.forEach(operation => {
            const {schemaName, data, embeddedPropertyName, update = false} = operation;
            
            const dataToCreate = {...data};
            if (dataToCreate[embeddedPropertyName]) {
                dataToCreate[embeddedPropertyName] = this.deepCopyEmbeddedObject(dataToCreate[embeddedPropertyName]);
            }
            
            realm.create(schemaName, dataToCreate, update);
        });
    }
    
    /**
     * Validates that an object is a managed Realm object
     * 
     * @param {Object} obj - Object to validate
     * @returns {boolean} True if object is managed
     */
    static isManagedObject(obj) {
        if (!obj) return false;
        
        // Try different methods to check if object is managed
        try {
            if (typeof obj.isManaged === 'function') {
                return obj.isManaged();
            } else if (obj.isManaged !== undefined) {
                return obj.isManaged;
            } else if (obj.isValid && typeof obj.isValid === 'function') {
                // If it has isValid method, it's likely a Realm object
                return obj.isValid();
            } else if (obj.schema || obj.objectSchema) {
                // If it has schema, it's likely a Realm object
                return true;
            }
        } catch (error) {
            // If any method fails, assume it's not managed
            return false;
        }
        
        return false;
    }
    
    /**
     * Validates that an object is an embedded object
     * 
     * @param {Object} obj - Object to validate
     * @returns {boolean} True if object is embedded
     */
    static isEmbeddedObject(obj) {
        if (!obj) return false;
        
        // Try different methods to check if object is embedded
        try {
            if (typeof obj.isEmbedded === 'function') {
                return obj.isEmbedded();
            } else if (obj.isEmbedded !== undefined) {
                return obj.isEmbedded;
            } else if (obj.objectSchema) {
                // Check schema for embedded property
                const schema = typeof obj.objectSchema === 'function' ? obj.objectSchema() : obj.objectSchema;
                return schema && schema.embedded;
            }
        } catch (error) {
            // If any method fails, assume it's not embedded
            return false;
        }
        
        return false;
    }
}

/**
 * Example usage patterns for different scenarios
 */
class EmbeddedObjectPatterns {
    
    /**
     * Pattern 1: Deep Copy Approach (Most Reliable)
     */
    static deepCopyPattern(realm) {
        realm.write(() => {
            const parent = realm.create("Parent", {
                id: "parent1",
                embeddedField: { /* embedded data */ }
            });
            
            const embeddedRef = parent.embeddedField;
            const plainCopy = RealmEmbeddedObjectUtils.deepCopyEmbeddedObject(embeddedRef);
            
            realm.create("NewObject", {
                name: "test",
                embeddedField: plainCopy
            });
        });
    }
    
    /**
     * Pattern 2: toJSON() Approach (Convenient)
     */
    static toJSONPattern(realm) {
        realm.write(() => {
            const parent = realm.create("Parent", {
                id: "parent1",
                embeddedField: { /* embedded data */ }
            });
            
            const embeddedRef = parent.embeddedField;
            const plainObject = RealmEmbeddedObjectUtils.toJSONCopy(embeddedRef);
            
            realm.create("NewObject", {
                name: "test",
                embeddedField: plainObject
            });
        });
    }
    
    /**
     * Pattern 3: Fresh Reference Approach (For Modifications)
     */
    static freshReferencePattern(realm) {
        realm.write(() => {
            const parent = realm.create("Parent", {
                id: "parent1",
                embeddedField: { /* embedded data */ }
            });
            
            // Get fresh managed reference for modification
            const freshParent = realm.objectForPrimaryKey("Parent", "parent1");
            const managedEmbedded = freshParent.embeddedField;
            managedEmbedded.someProperty = "new value";
        });
    }
    
    /**
     * Pattern 4: Separate Transactions Approach
     */
    static separateTransactionsPattern(realm) {
        // First transaction: create objects
        realm.write(() => {
            realm.create("Parent", {
                id: "parent1",
                embeddedField: { /* embedded data */ }
            });
        });
        
        // Second transaction: use managed references
        realm.write(() => {
            const parent = realm.objectForPrimaryKey("Parent", "parent1");
            const embeddedRef = parent.embeddedField; // Now it's managed
            
            // Use deep copy for new object creation
            const plainCopy = RealmEmbeddedObjectUtils.deepCopyEmbeddedObject(embeddedRef);
            realm.create("NewObject", {
                name: "test",
                embeddedField: plainCopy
            });
        });
    }
}

export { RealmEmbeddedObjectUtils, EmbeddedObjectPatterns };
