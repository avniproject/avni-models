import ObservationsHolder from "../ObservationsHolder";
import Encounter from '../Encounter';
import BaseEntity from "../BaseEntity";
import EncounterType from "../EncounterType";
import Individual from "../Individual";
import {Observation} from "../index";
import Point from "../geo/Point";
import SchemaNames from "../SchemaNames";


class DraftEncounter extends BaseEntity {
  static schema = {
    name: SchemaNames.DraftEncounter,
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      encounterType: { type: 'object', objectType: 'EncounterType' },
      encounterDateTime: {type: "date", optional: true},
      individual: { type: 'object', objectType: 'Individual' },
      observations: {type: "list", objectType: "Observation"},
      encounterLocation: {type: SchemaNames.Point, optional: true},
      name: {type: "string", optional: true},
      earliestVisitDateTime: {type: "date", optional: true},
      maxVisitDateTime: {type: "date", optional: true},
      cancelDateTime: {type: "date", optional: true},
      cancelObservations: {type: "list", objectType: "Observation"},
      cancelLocation: {type: SchemaNames.Point, optional: true},
      voided: {type: "bool", default: false}
    },
  };

  constructor(that = null) {
    super(that);
  }

  get encounterType() {
      return this.toEntity("encounterType", EncounterType);
  }

  set encounterType(x) {
      this.that.encounterType = this.fromObject(x);
  }

  get encounterDateTime() {
      return this.that.encounterDateTime;
  }

  set encounterDateTime(x) {
      this.that.encounterDateTime = x;
  }

  get individual() {
      return this.toEntity("individual", Individual);
  }

  set individual(x) {
      this.that.individual = this.fromObject(x);
  }

  get observations() {
      return this.toEntityList("observations", Observation);
  }

  set observations(x) {
      this.that.observations = this.fromEntityList(x);
  }

  get encounterLocation() {
      return this.toEntity("encounterLocation", Point);
  }

  set encounterLocation(x) {
      this.that.encounterLocation = this.fromObject(x);
  }

  get name() {
      return this.that.name;
  }

  set name(x) {
      this.that.name = x;
  }

  get earliestVisitDateTime() {
      return this.that.earliestVisitDateTime;
  }

  set earliestVisitDateTime(x) {
      this.that.earliestVisitDateTime = x;
  }

  get maxVisitDateTime() {
      return this.that.maxVisitDateTime;
  }

  set maxVisitDateTime(x) {
      this.that.maxVisitDateTime = x;
  }

  get cancelDateTime() {
      return this.that.cancelDateTime;
  }

  set cancelDateTime(x) {
      this.that.cancelDateTime = x;
  }

  get cancelObservations() {
      return this.toEntityList("cancelObservations", Observation);
  }

  set cancelObservations(x) {
      this.that.cancelObservations = this.fromEntityList(x);
  }

  get cancelLocation() {
      return this.toEntity("cancelLocation", Point);
  }

  set cancelLocation(x) {
      this.that.cancelLocation = this.fromObject(x);
  }

  static create(encounter) {
    const draftEncounter = new DraftEncounter();
    draftEncounter.uuid = encounter.uuid;
    draftEncounter.encounterType = encounter.encounterType;
    draftEncounter.encounterDateTime = encounter.encounterDateTime;
    draftEncounter.individual = encounter.individual;
    draftEncounter.observations = ObservationsHolder.clone(encounter.observations);
    draftEncounter.encounterLocation = encounter.encounterLocation;
    draftEncounter.name = encounter.name;
    draftEncounter.earliestVisitDateTime = encounter.earliestVisitDateTime;
    draftEncounter.maxVisitDateTime = encounter.maxVisitDateTime;
    draftEncounter.cancelDateTime = encounter.cancelDateTime;
    draftEncounter.cancelObservations = ObservationsHolder.clone(encounter.cancelObservations);
    draftEncounter.cancelLocation = encounter.cancelLocation;
    draftEncounter.voided = encounter.voided;
    return draftEncounter;
  }

  constructEncounter() {
    const encounter = new Encounter();
    encounter.uuid = this.uuid;
    encounter.encounterType = this.encounterType;
    encounter.encounterDateTime = this.encounterDateTime;
    encounter.individual = this.individual;
    encounter.observations = ObservationsHolder.clone(this.observations);
    encounter.encounterLocation = this.encounterLocation;
    encounter.name = this.name;
    encounter.earliestVisitDateTime = this.earliestVisitDateTime;
    encounter.maxVisitDateTime = this.maxVisitDateTime;
    encounter.cancelDateTime = this.cancelDateTime;
    encounter.cancelObservations = ObservationsHolder.clone(this.cancelObservations);
    encounter.cancelLocation = this.cancelLocation;
    encounter.voided = this.voided;
    encounter.approvalStatuses = [];
    return encounter;
  }
}

export default DraftEncounter;
