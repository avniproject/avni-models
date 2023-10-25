import {EntityMappingConfig} from "../src";

xit('should get all non optional object properties', function () {
  let instance = EntityMappingConfig.getInstance();
  console.log(instance.mandatoryObjectSchemaProperties.map((x) => `${x.definedSchema.name} --> ${x.propertyName}`));
});
