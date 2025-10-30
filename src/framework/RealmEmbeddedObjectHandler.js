import _ from "lodash";
import {isRealmObject} from "./RealmCollectionHelper";

/**
 * Framework-level handler for embedded object safety in Realm 12+
 * This automatically processes embedded objects to prevent invalidation issues
 */
class RealmEmbeddedObjectHandler {
    
    /**
     * Automatically processes embedded objects in a data structure
     * This should be called by RealmProxy.create() before creating objects
     * 
     * @param {Object} data - The object data to process
     * @param {Object} schema - The Realm schema for the object
     * @returns {Object} Processed data with safe embedded objects
     */
    static processEmbeddedObjects(data, schema) {
        if (!data || !schema || !schema.properties) {
            return data || {};
        }
        
        const processedData = {...data};
        
        Object.keys(schema.properties).forEach(propertyName => {
            const propertySchema = schema.properties[propertyName];
            const propertyValue = data[propertyName];
            
            // Handle embedded objects (including optional ones)
            if (this.isEmbeddedObjectProperty(propertySchema) && propertyValue) {
                processedData[propertyName] = this.safeCopyEmbeddedObject(propertyValue);
            }
            
            // Handle lists with embedded objects
            if (this.isListOfEmbeddedObjects(propertySchema) && Array.isArray(propertyValue)) {
                processedData[propertyName] = propertyValue.map(item => 
                    item ? this.safeCopyEmbeddedObject(item) : item
                );
            }
        });
        
        return processedData;
    }
    
    /**
     * Checks if a property schema defines an embedded object
     */
    static isEmbeddedObjectProperty(propertySchema) {
        if (!propertySchema || propertySchema.type !== 'object') {
            return false;
        }
        return !!(propertySchema.objectType && propertySchema.objectType !== 'string');
    }
    
    /**
     * Checks if a property schema defines a list of embedded objects
     */
    static isListOfEmbeddedObjects(propertySchema) {
        return propertySchema && 
               propertySchema.type === 'list' && 
               propertySchema.objectType && 
               propertySchema.objectType !== 'string';
    }
    
    /**
     * Safely copies an embedded object using the best available method
     */
    static safeCopyEmbeddedObject(embeddedObj) {
        if (!embeddedObj) {
            return null;
        }
        
        // If it's not a Realm object, return as-is
        if (!isRealmObject(embeddedObj)) {
            return embeddedObj;
        }
        
        try {
            // Method 1: Try toJSON() (convenient)
            if (typeof embeddedObj.toJSON === 'function') {
                return embeddedObj.toJSON();
            }
        } catch (error) {
            // Fall back to manual copy if toJSON fails
        }
        
        // Method 2: Manual deep copy (reliable)
        return this.deepCopyEmbeddedObject(embeddedObj);
    }
    
    /**
     * Manual deep copy of embedded object
     */
    static deepCopyEmbeddedObject(embeddedObj) {
        if (!embeddedObj) {
            return null;
        }
        
        const plainCopy = {};
        
        // Try to get schema properties
        try {
            if (embeddedObj.objectSchema && typeof embeddedObj.objectSchema === 'function') {
                const schema = embeddedObj.objectSchema();
                if (schema && schema.properties) {
                    Object.keys(schema.properties).forEach(prop => {
                        plainCopy[prop] = embeddedObj[prop];
                    });
                    return plainCopy;
                }
            }
        } catch (error) {
            // Fall back to enumerable properties
        }
        
        // Fallback: Copy all enumerable properties
        Object.keys(embeddedObj).forEach(prop => {
            if (typeof embeddedObj[prop] !== 'function') {
                plainCopy[prop] = embeddedObj[prop];
            }
        });
        
        return plainCopy;
    }
}

export default RealmEmbeddedObjectHandler;
