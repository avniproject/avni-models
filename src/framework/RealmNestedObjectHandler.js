import _ from "lodash";
import {isRealmObject} from "./RealmCollectionHelper";

/**
 * Framework-level handler for nested object safety in Realm 12+
 * This automatically processes nested objects (relationships) to prevent invalidation issues
 * Note: This handles ALL nested objects, not just Realm's embedded object feature
 */
class RealmNestedObjectHandler {
    
    /**
     * Automatically processes nested objects in a data structure
     * This should be called by RealmProxy.create() before creating objects
     * 
     * @param {Object} data - The object data to process
     * @param {Object} schema - The Realm schema for the object
     * @returns {Object} Processed data with safe nested objects
     */
    static processNestedObjects(data, schema) {
        if (!data || !schema || !schema.properties) {
            return data || {};
        }
        
        const processedData = {...data};
        
        Object.keys(schema.properties).forEach(propertyName => {
            const propertySchema = schema.properties[propertyName];
            const propertyValue = data[propertyName];
            
            // Handle nested objects (including optional ones)
            if (this.isNestedObjectProperty(propertySchema) && propertyValue) {
                processedData[propertyName] = this.safeCopyNestedObject(propertyValue);
            }
            
            // Handle lists with nested objects
            if (this.isListOfNestedObjects(propertySchema) && Array.isArray(propertyValue)) {
                processedData[propertyName] = propertyValue.map(item => 
                    item ? this.safeCopyNestedObject(item) : item
                );
            }
        });
        
        return processedData;
    }
    
    /**
     * Checks if a property schema defines a nested object (relationship)
     */
    static isNestedObjectProperty(propertySchema) {
        if (!propertySchema || propertySchema.type !== 'object') {
            return false;
        }
        return !!(propertySchema.objectType && propertySchema.objectType !== 'string');
    }
    
    /**
     * Checks if a property schema defines a list of nested objects
     */
    static isListOfNestedObjects(propertySchema) {
        return propertySchema && 
               propertySchema.type === 'list' && 
               propertySchema.objectType && 
               propertySchema.objectType !== 'string';
    }
    
    /**
     * Safely copies a nested object using the best available method
     */
    static safeCopyNestedObject(nestedObj) {
        if (!nestedObj) {
            return null;
        }
        
        // If it's not a Realm object, return as-is
        if (!isRealmObject(nestedObj)) {
            return nestedObj;
        }
        
        try {
            // Method 1: Try toJSON() (convenient)
            if (typeof nestedObj.toJSON === 'function') {
                return nestedObj.toJSON();
            }
        } catch (error) {
            // Fall back to manual copy if toJSON fails
        }
        
        // Method 2: Manual deep copy (reliable)
        return this.deepCopyNestedObject(nestedObj);
    }
    
    /**
     * Manual deep copy of nested object
     */
    static deepCopyNestedObject(nestedObj) {
        if (!nestedObj) {
            return null;
        }
        
        const plainCopy = {};
        
        // Try to get schema properties
        try {
            if (nestedObj.objectSchema && typeof nestedObj.objectSchema === 'function') {
                const schema = nestedObj.objectSchema();
                if (schema && schema.properties) {
                    Object.keys(schema.properties).forEach(prop => {
                        plainCopy[prop] = nestedObj[prop];
                    });
                    return plainCopy;
                }
            }
        } catch (error) {
            // Fall back to enumerable properties
        }
        
        // Fallback: Copy all enumerable properties
        Object.keys(nestedObj).forEach(prop => {
            if (typeof nestedObj[prop] !== 'function') {
                plainCopy[prop] = nestedObj[prop];
            }
        });
        
        return plainCopy;
    }
}

export default RealmNestedObjectHandler;
