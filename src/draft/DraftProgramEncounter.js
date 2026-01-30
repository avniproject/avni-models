import ObservationsHolder from "../ObservationsHolder";
import ProgramEncounter from '../ProgramEncounter';
import BaseEntity from "../BaseEntity";
import EncounterType from "../EncounterType";
import ProgramEnrolment from "../ProgramEnrolment";
import Observation from "../Observation";
import Point from "../geo/Point";
import SchemaNames from "../SchemaNames";


class DraftProgramEncounter extends BaseEntity {
  static schema = {
    name: SchemaNames.DraftProgramEncounter,
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      name: {type: "string", optional: true},
      encounterType: { type: 'object', objectType: 'EncounterType' },
      earliestVisitDateTime: {type: "date", optional: true},
      maxVisitDateTime: {type: "date", optional: true},
      encounterDateTime: {type: "date", optional: true},
      programEnrolment: { type: 'object', objectType: 'ProgramEnrolment' },
      observations: {type: "list", objectType: "Observation"},
      cancelDateTime: {type: "date", optional: true},
      cancelObservations: {type: "list", objectType: "Observation"},
      encounterLocation: { type: 'object', objectType: 'Point', optional: true },
      cancelLocation: { type: 'object', objectType: 'Point', optional: true },
      voided: {type: "bool", default: false},
      updatedOn: "date"
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

  get encounterDateTime() {
    return this.that.encounterDateTime;
  }

  set encounterDateTime(x) {
    this.that.encounterDateTime = x;
  }

  get programEnrolment() {
    return this.toEntity("programEnrolment", ProgramEnrolment);
  }

  set programEnrolment(x) {
    this.that.programEnrolment = this.fromObject(x);
  }

  get observations() {
    return this.toEntityList("observations", Observation);
  }

  set observations(x) {
    this.that.observations = this.fromEntityList(x);
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

  get encounterLocation() {
    return this.toEntity("encounterLocation", Point);
  }

  set encounterLocation(x) {
    this.that.encounterLocation = this.fromObject(x);
  }

  get cancelLocation() {
    return this.toEntity("cancelLocation", Point);
  }

  set cancelLocation(x) {
    this.that.cancelLocation = this.fromObject(x);
  }

  get updatedOn() {
    return this.that.updatedOn;
  }

  set updatedOn(x) {
    this.that.updatedOn = x;
  }

  static create(programEncounter) {
    const draftProgramEncounter = new DraftProgramEncounter();
    draftProgramEncounter.uuid = programEncounter.uuid;
    draftProgramEncounter.name = programEncounter.name;
    draftProgramEncounter.encounterType = programEncounter.encounterType;
    draftProgramEncounter.earliestVisitDateTime = programEncounter.earliestVisitDateTime;
    draftProgramEncounter.maxVisitDateTime = programEncounter.maxVisitDateTime;
    draftProgramEncounter.encounterDateTime = programEncounter.encounterDateTime;
    draftProgramEncounter.programEnrolment = programEncounter.programEnrolment;
    draftProgramEncounter.observations = ObservationsHolder.clone(programEncounter.observations);
    draftProgramEncounter.cancelDateTime = programEncounter.cancelDateTime;
    draftProgramEncounter.cancelObservations = ObservationsHolder.clone(programEncounter.cancelObservations);
    draftProgramEncounter.encounterLocation = programEncounter.encounterLocation;
    draftProgramEncounter.cancelLocation = programEncounter.cancelLocation;
    draftProgramEncounter.voided = programEncounter.voided;
    draftProgramEncounter.updatedOn = new Date();
    return draftProgramEncounter;
  }

  constructProgramEncounter() {
    const programEncounter = new ProgramEncounter();
    programEncounter.uuid = this.uuid;
    programEncounter.name = this.name;
    programEncounter.encounterType = this.encounterType;
    programEncounter.earliestVisitDateTime = this.earliestVisitDateTime;
    programEncounter.maxVisitDateTime = this.maxVisitDateTime;
    programEncounter.encounterDateTime = this.encounterDateTime;
    programEncounter.programEnrolment = this.programEnrolment;
    programEncounter.observations = ObservationsHolder.clone(this.observations);
    programEncounter.cancelDateTime = this.cancelDateTime;
    programEncounter.cancelObservations = ObservationsHolder.clone(this.cancelObservations);
    programEncounter.encounterLocation = this.encounterLocation;
    programEncounter.cancelLocation = this.cancelLocation;
    programEncounter.voided = this.voided;
    programEncounter.approvalStatuses = [];
    return programEncounter;
  }
}

export default DraftProgramEncounter;
