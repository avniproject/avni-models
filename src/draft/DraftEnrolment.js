import ObservationsHolder from "../ObservationsHolder";
import ProgramEnrolment from '../ProgramEnrolment';
import BaseEntity from "../BaseEntity";
import Program from "../Program";
import Individual from "../Individual";
import Observation from "../Observation";
import Point from "../geo/Point";
import SchemaNames from "../SchemaNames";
import _ from "lodash";


class DraftEnrolment extends BaseEntity {
  static schema = {
    name: SchemaNames.DraftEnrolment,
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      program: { type: 'object', objectType: 'Program' },
      enrolmentDateTime: "date",
      individual: { type: 'object', objectType: 'Individual' },
      observations: {type: "list", objectType: "Observation"},
      enrolmentLocation: { type: 'object', objectType: 'Point', optional: true },
      programExitDateTime: {type: "date", optional: true},
      programExitObservations: {type: "list", objectType: "Observation"},
      exitLocation: { type: 'object', objectType: 'Point', optional: true },
      voided: {type: "bool", default: false},
      updatedOn: "date"
    },
  };

  constructor(that = null) {
    super(that);
  }

  get program() {
    return this.toEntity("program", Program);
  }

  set program(x) {
    this.that.program = this.fromObject(x);
  }

  get enrolmentDateTime() {
    return this.that.enrolmentDateTime;
  }

  set enrolmentDateTime(x) {
    this.that.enrolmentDateTime = x;
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

  get enrolmentLocation() {
    return this.toEntity("enrolmentLocation", Point);
  }

  set enrolmentLocation(x) {
    this.that.enrolmentLocation = this.fromObject(x);
  }

  get programExitDateTime() {
    return this.that.programExitDateTime;
  }

  set programExitDateTime(x) {
    this.that.programExitDateTime = x;
  }

  get programExitObservations() {
    return this.toEntityList("programExitObservations", Observation);
  }

  set programExitObservations(x) {
    this.that.programExitObservations = this.fromEntityList(x);
  }

  get exitLocation() {
    return this.toEntity("exitLocation", Point);
  }

  set exitLocation(x) {
    this.that.exitLocation = this.fromObject(x);
  }

  get updatedOn() {
    return this.that.updatedOn;
  }

  set updatedOn(x) {
    this.that.updatedOn = x;
  }

  static create(enrolment) {
    const draftEnrolment = new DraftEnrolment();
    draftEnrolment.uuid = enrolment.uuid;
    draftEnrolment.program = enrolment.program;
    draftEnrolment.enrolmentDateTime = enrolment.enrolmentDateTime;
    draftEnrolment.individual = enrolment.individual;
    draftEnrolment.observations = ObservationsHolder.clone(enrolment.observations);
    draftEnrolment.enrolmentLocation = enrolment.enrolmentLocation;
    draftEnrolment.programExitDateTime = enrolment.programExitDateTime;
    draftEnrolment.programExitObservations = ObservationsHolder.clone(enrolment.programExitObservations);
    draftEnrolment.exitLocation = enrolment.exitLocation;
    draftEnrolment.voided = enrolment.voided;
    draftEnrolment.updatedOn = new Date();
    return draftEnrolment;
  }

  constructEnrolment() {
    const enrolment = new ProgramEnrolment();
    enrolment.uuid = this.uuid;
    enrolment.program = _.isNil(this.program) ? null : this.program.clone();
    enrolment.enrolmentDateTime = this.enrolmentDateTime;
    enrolment.individual = this.individual;
    enrolment.observations = ObservationsHolder.clone(this.observations);
    enrolment.enrolmentLocation = _.isNil(this.enrolmentLocation)
      ? null
      : this.enrolmentLocation.clone();
    enrolment.programExitDateTime = this.programExitDateTime;
    enrolment.programExitObservations = ObservationsHolder.clone(this.programExitObservations);
    enrolment.exitLocation = _.isNil(this.exitLocation) ? null : this.exitLocation.clone();
    enrolment.voided = this.voided;
    enrolment.encounters = [];
    enrolment.checklists = [];
    enrolment.approvalStatuses = [];
    return enrolment;
  }
}

export default DraftEnrolment;
