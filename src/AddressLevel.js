import BaseEntity from "./BaseEntity";
import ResourceUtil from "./utility/ResourceUtil";
import General from "./utility/General";
import _ from "lodash";
import Observation from "./Observation";
import SchemaNames from "./SchemaNames";

const PARENT_LOCATION_UUID = "parentLocationUUID";
const CHILD_LOCATION_UUID = "locationUUID";

function appendLineage(addressLevel, accumulator) {
  if (_.isNil(addressLevel)) return accumulator;

  accumulator.push(addressLevel);
  const parent = addressLevel.getParent();
  return appendLineage(parent, accumulator);
}

export class LocationMapping extends BaseEntity {
  static schema = {
    name: SchemaNames.LocationMapping,
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      parent: { type: 'object', objectType: 'AddressLevel' },
      child: { type: 'object', objectType: 'AddressLevel' },
      voided: {type: "bool", default: false},
    },
  };

  constructor(that = null) {
    super(that);
  }

  get parent() {
    return this.toEntity("parent", AddressLevel);
  }

  set parent(x) {
    this.that.parent = this.fromObject(x);
  }

  get child() {
    return this.toEntity("child", AddressLevel);
  }

  set child(x) {
    this.that.child = this.fromObject(x);
  }

  static create({uuid, parent, child, voided}) {
    return _.assignIn(new LocationMapping(), {uuid, parent, child, voided});
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

  constructor(that = null) {
    super(that);
  }

  get name() {
    return this.that.name;
  }

  set name(x) {
    this.that.name = x;
  }

  get level() {
    return this.that.level;
  }

  set level(x) {
    this.that.level = x;
  }

  get type() {
    return this.that.type;
  }

  set type(x) {
    this.that.type = x;
  }

  get locationMappings() {
    return this.toEntityList("locationMappings", LocationMapping);
  }

  set locationMappings(x) {
    this.that.locationMappings = this.fromEntityList(x);
  }

  get locationProperties() {
    return this.toEntityList("locationProperties", Observation);
  }

  set locationProperties(x) {
    this.that.locationProperties = this.fromEntityList(x);
  }

  get titleLineage() {
    return this.that.titleLineage;
  }

  set titleLineage(x) {
    this.that.titleLineage = x;
  }

  get parentUuid() {
    return this.that.parentUuid;
  }

  set parentUuid(x) {
    this.that.parentUuid = x;
  }

  get typeUuid() {
    return this.that.typeUuid;
  }

  set typeUuid(x) {
    this.that.typeUuid = x;
  }

  static create({
                  uuid,
                  title,
                  level,
                  typeString,
                  locationMappings = [],
                  titleLineage,
                  voided,
                  parentUuid,
                  typeUuid,
                  locationProperties
                }, entityService) {
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

  getParent() {
    return _.get(this, "locationMappings[0].parent");
  }

  /**
   * return all parent
   */
  getLineage() {
    return appendLineage(this, []);
  }

  findObservation(conceptNameOrUuid, parentConceptNameOrUuid) {
    const observations = _.isNil(parentConceptNameOrUuid) ? this.locationProperties : this.findGroupedObservation(parentConceptNameOrUuid);
    return _.find(observations, (observation) => {
      return (observation.concept.name === conceptNameOrUuid) || (observation.concept.uuid === conceptNameOrUuid);
    });
  }

  findGroupedObservation(parentConceptNameOrUuid) {
      const groupedObservations = _.find(this.locationProperties, (observation) =>
          (observation.concept.name === parentConceptNameOrUuid) || (observation.concept.uuid === parentConceptNameOrUuid));
      return _.isEmpty(groupedObservations) ? [] : groupedObservations.getValue();
  }

  getObservationReadableValue(conceptNameOrUuid, parentConceptNameOrUuid) {
      const observationForConcept = this.findObservation(conceptNameOrUuid, parentConceptNameOrUuid);
      return _.isEmpty(observationForConcept)
          ? observationForConcept
          : observationForConcept.getReadableValue();
  }

}

export default AddressLevel;
