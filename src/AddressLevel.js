import BaseEntity from "./BaseEntity";
import ResourceUtil from "./utility/ResourceUtil";
import General from "./utility/General";
import _ from "lodash";

const PARENT_LOCATION_UUID = "parentLocationUUID";
const CHILD_LOCATION_UUID = "locationUUID";

export class LocationMapping extends BaseEntity {
  static schema = {
    name: "LocationMapping",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      parent: "AddressLevel",
      child: "AddressLevel",
      voided: { type: "bool", default: false },
    },
  };

  static create({ uuid, parent, child, voided }) {
    return _.assignIn(new LocationMapping(), { uuid, parent, child, voided });
  }

  static fromResource(resource, entityService) {
    return LocationMapping.create({
      uuid: resource.uuid,
      parent: entityService.findByKey(
        "uuid",
        ResourceUtil.getUUIDFor(resource, PARENT_LOCATION_UUID),
        AddressLevel.schema.name
      ),
      child: entityService.findByKey(
        "uuid",
        ResourceUtil.getUUIDFor(resource, CHILD_LOCATION_UUID),
        AddressLevel.schema.name
      ),
      voided: !!resource.voided,
    });
  }

  static parentAssociations = () => new Map([[AddressLevel, PARENT_LOCATION_UUID]]);
}

class AddressLevel extends BaseEntity {
  static schema = {
    name: "AddressLevel",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      name: "string",
      level: "double",
      type: {type: "string", optional: true},
      locationMappings: {type: "list", objectType: "LocationMapping"},
      locationProperties: {type: "list", objectType: "Observation"},
      titleLineage: {type: "string", optional: true},
      voided: {type: "bool", default: false},
      parentUuid: {type: "string", optional: true},
      typeUuid: {type: "string", optional: true}
    },
  };
  uuid;
  name;

  static create({uuid, title, level, typeString, locationMappings = [], titleLineage, voided, parentUuid, typeUuid, locationProperties}, entityService) {
    const addressLevel = _.assignIn(new AddressLevel(), {
      uuid,
      name: title,
      type: typeString,
      level,
      locationMappings,
      titleLineage,
      voided,
      parentUuid,
      typeUuid
    });
    return General.assignObsFields({locationProperties}, addressLevel, ['locationProperties'], entityService);
  }

  static fromResource(resource, entityService) {
    return AddressLevel.create(resource, entityService);
  }

  static associateLocationMapping(locationMapping, locationMappingRes, entityService) {
    let location = BaseEntity.getParentEntity(
      entityService,
      LocationMapping,
      locationMappingRes,
      CHILD_LOCATION_UUID,
      AddressLevel.schema.name
    );
    location = General.pick(location, ["uuid"], ["locationMappings"]);
    BaseEntity.addNewChild(locationMapping, location.locationMappings);
    return location;
  }

  static associateChild(child, childEntityClass, childResource, entityService) {
    if (childEntityClass === LocationMapping) {
      return AddressLevel.associateLocationMapping(child, childResource, entityService);
    }
    throw `${childEntityClass.name} not support by ${AddressLevel.schema.name}.associateChild()`;
  }

  static merge = () => BaseEntity.mergeOn("locationMappings");

  static parentAssociations = () => new Map([[AddressLevel, CHILD_LOCATION_UUID]]);

  static childAssociations = () => new Map([[LocationMapping, "locationMappings"]]);

  getParentLocations() {
    return _.filter(this.locationMappings, (locationMapping) => !locationMapping.voided).map(
      (locationMapping) => locationMapping.parent
    );
  }

  cloneForReference() {
    return AddressLevel.create(_.assignIn({
      title: this.name,
      typeString: this.type,
      titleLineage: this.titleLineage,
      voided: this.voided
    }, this));
  }

  get translatedFieldValue() {
    return this.name;
  }
}

export default AddressLevel;
