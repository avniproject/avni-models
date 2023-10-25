import _ from "lodash";

// https://www.mongodb.com/docs/realm/sdk/react-native/model-data/data-types/property-types/#std-label-react-native-supported-property-types
const inBuiltPropertyTypes = ["bool", "int", "float", "double", "string", "decimal128", "objectId", "data", "date", "list", "linkingObjects", "dictionary", "set", "mixed", "uuid"];

class DefinedObjectSchema {
  properties;

  static getNonOptionalObjectProperties(definedSchema) {
    return Object.keys(definedSchema.properties).filter((key) => {
      const value = definedSchema.properties[key];
      const isSimpleDefinition = typeof value === 'string';
      const type = isSimpleDefinition ? value : value["type"];
      const contains = _.some(inBuiltPropertyTypes, (x) => type.replace("?", "") === x);
      return !contains && (isSimpleDefinition ? true : !value["optional"]);
    });
  }
}

export default DefinedObjectSchema;
