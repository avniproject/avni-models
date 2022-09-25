import _ from "lodash";

const listPropertyTypeName = "list";
const objectPropertyTypeName = "object";

class RealmObjectSchema {
  constructor(schema) {
    this.schema = schema;
  }

  getPrimitiveProperties() {
    return _.keys(_.pickBy(this.schema.properties, (x) => x.type !== listPropertyTypeName && x.type !== objectPropertyTypeName));
  }

  getListProperties() {
    return _.keys(_.pickBy(this.schema.properties, (x) => x.type === listPropertyTypeName));
  }

  getObjectProperties() {
    return _.keys(_.pickBy(this.schema.properties, (x) => x.type === objectPropertyTypeName));
  }

  getAllProperties() {
    return _.keys(this.schema.properties);
  }
}

export default RealmObjectSchema;
