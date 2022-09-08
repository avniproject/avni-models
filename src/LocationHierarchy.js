import BaseEntity from "./BaseEntity";
import _ from "lodash";

class LocationHierarchy extends BaseEntity {
  static schema = {
    name: "LocationHierarchy",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      name: "string",
      type: {type: "string", optional: true},
      level: "double",
      parentUuid: {type: "string", optional: true},
      titleLineage: {type: "string", optional: true},
      voided: {type: "bool", default: false},
      typeUuid: {type: "string", optional: true}
    },
  };

  mapNonPrimitives(realmObject, entityMapper) {
  }

  static create({uuid, title, level, typeString, parentUuid, titleLineage, voided, typeUuid}) {
    return _.assignIn(new LocationHierarchy(), {
      uuid,
      name: title,
      type: typeString,
      level,
      parentUuid,
      titleLineage,
      voided,
      typeUuid
    });
  }

  static fromResource(resource) {
    return LocationHierarchy.create(resource);
  }

  cloneForReference() {
    return LocationHierarchy.create(_.assignIn({
      title: this.name,
      typeString: this.type,
      level: this.level,
      parentUuid: this.parentUuid,
      titleLineage: this.titleLineage,
      voided: this.voided
    }, this));
  }

}

export default LocationHierarchy;
