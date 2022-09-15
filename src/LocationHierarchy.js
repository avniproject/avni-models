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

  constructor(that) {
    super(that);
  }

  get name() {
      return this.that.name;
  }

  set name(x) {
      this.that.name = x;
  }

  get type() {
      return this.that.type;
  }

  set type(x) {
      this.that.type = x;
  }

  get level() {
      return this.that.level;
  }

  set level(x) {
      this.that.level = x;
  }

  get parentUuid() {
      return this.that.parentUuid;
  }

  set parentUuid(x) {
      this.that.parentUuid = x;
  }

  get titleLineage() {
      return this.that.titleLineage;
  }

  set titleLineage(x) {
      this.that.titleLineage = x;
  }

  get typeUuid() {
      return this.that.typeUuid;
  }

  set typeUuid(x) {
      this.that.typeUuid = x;
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
