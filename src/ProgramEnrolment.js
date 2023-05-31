import General from "./utility/General";
import ResourceUtil from "./utility/ResourceUtil";
import Program from "./Program";
import ProgramOutcome from "./ProgramOutcome";
import ProgramEncounter from "./ProgramEncounter";
import BaseEntity from "./BaseEntity";
import Individual from "./Individual";
import _ from "lodash";
import moment from "moment";
import ObservationsHolder from "./ObservationsHolder";
import ValidationResult from "./application/ValidationResult";
import Checklist from "./Checklist";
import {findMediaObservations} from "./Media";
import Point from "./geo/Point";
import EntityApprovalStatus from "./EntityApprovalStatus";
import Observation from "./Observation";
import SchemaNames from "./SchemaNames";

const mergeMap = new Map([
  [SchemaNames.ProgramEncounter, "encounters"],
  [SchemaNames.Checklist, "checklists"],
  [SchemaNames.EntityApprovalStatus, "approvalStatuses"]
]);

class ProgramEnrolment extends BaseEntity {
  static schema = {
    name: SchemaNames.ProgramEnrolment,
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      program: "Program",
      enrolmentDateTime: "date",
      observations: {type: "list", objectType: "Observation"},
      programExitDateTime: {type: "date", optional: true},
      programExitObservations: {type: "list", objectType: "Observation"},
      programOutcome: {type: "ProgramOutcome", optional: true},
      encounters: {type: "list", objectType: SchemaNames.ProgramEncounter},
      checklists: {type: "list", objectType: "Checklist"},
      individual: "Individual",
      enrolmentLocation: {type: "Point", optional: true},
      exitLocation: {type: "Point", optional: true},
      voided: {type: "bool", default: false},
      approvalStatuses: {type: "list", objectType: "EntityApprovalStatus"},
      latestEntityApprovalStatus: {type: "EntityApprovalStatus", optional: true}   //Reporting purposes
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

  get observations() {
    return this.toEntityList("observations", Observation);
  }

  set observations(x) {
    this.that.observations = this.fromEntityList(x);
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

  get programOutcome() {
    return this.toEntity("programOutcome", ProgramOutcome);
  }

  set programOutcome(x) {
    this.that.programOutcome = this.fromObject(x);
  }

  get encounters() {
    return this.toEntityList("encounters", ProgramEncounter);
  }

  set encounters(x) {
    this.that.encounters = this.fromEntityList(x);
  }

  get checklists() {
    return this.toEntityList("checklists", Checklist);
  }

  set checklists(x) {
    this.that.checklists = this.fromEntityList(x);
  }

  get individual() {
    return this.toEntity("individual", Individual);
  }

  set individual(x) {
    this.that.individual = this.fromObject(x);
  }

  get enrolmentLocation() {
    return this.toEntity("enrolmentLocation", Point);
  }

  set enrolmentLocation(x) {
    this.that.enrolmentLocation = this.fromObject(x);
  }

  get exitLocation() {
    return this.toEntity("exitLocation", Point);
  }

  set exitLocation(x) {
    this.that.exitLocation = this.fromObject(x);
  }

  get latestEntityApprovalStatus() {
    return _.maxBy(this.approvalStatuses, 'statusDateTime');
  }

  get approvalStatuses() {
    return this.toEntityList("approvalStatuses", EntityApprovalStatus);
  }

  set approvalStatuses(x) {
    this.that.approvalStatuses = this.fromEntityList(x);
  }

  static createEmptyInstance({individual, program} = {}) {
    const programEnrolment = new ProgramEnrolment();
    programEnrolment.uuid = General.randomUUID();
    programEnrolment.enrolmentDateTime = new Date();
    programEnrolment.observations = [];
    programEnrolment.programExitObservations = [];
    programEnrolment.encounters = [];
    programEnrolment.checklists = [];
    programEnrolment.individual = individual
      ? individual.cloneForEdit()
      : Individual.createEmptyInstance();
    programEnrolment.voided = false;
    programEnrolment.program = program;
    programEnrolment.approvalStatuses = [];
    ObservationsHolder.convertObsForSave(programEnrolment.individual.observations);
    return programEnrolment;
  }

  get toResource() {
    const resource = _.pick(this, ["uuid", "voided"]);
    resource["programUUID"] = this.program.uuid;
    resource.enrolmentDateTime = General.isoFormat(this.enrolmentDateTime);
    resource.programExitDateTime = General.isoFormat(this.programExitDateTime);
    resource["programOutcomeUUID"] = _.isNil(this.programOutcome) ? null : this.programOutcome.uuid;
    resource["individualUUID"] = this.individual.uuid;
    if (!_.isNil(this.checklist)) resource["checklistUUID"] = this.checklist.uuid;

    resource["observations"] = [];
    this.observations.forEach((obs) => {
      resource["observations"].push(obs.toResource);
    });

    if (!_.isNil(this.enrolmentLocation)) {
      resource["enrolmentLocation"] = this.enrolmentLocation.toResource;
    }
    if (!_.isNil(this.exitLocation)) {
      resource["exitLocation"] = this.exitLocation.toResource;
    }

    resource["programExitObservations"] = [];
    this.programExitObservations.forEach((obs) => {
      resource["programExitObservations"].push(obs.toResource);
    });

    return resource;
  }

  static fromResource(resource, entityService) {
    const program = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "programUUID"),
      Program.schema.name
    );
    const programOutcomeUUID = ResourceUtil.getUUIDFor(resource, "programOutcomeUUID");
    const individual = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "individualUUID"),
      Individual.schema.name
    );

    const programEnrolment = General.assignFields(
      resource,
      new ProgramEnrolment(),
      ["uuid", "voided"],
      ["enrolmentDateTime", "programExitDateTime"],
      ["observations", "programExitObservations"],
      entityService
    );
    programEnrolment.program = program;
    programEnrolment.individual = individual;

    if (!_.isNil(programOutcomeUUID)) {
      programEnrolment.programOutcome = entityService.findByKey(
        "uuid",
        programOutcomeUUID,
        ProgramOutcome.schema.name
      );
    }

    if (!_.isNil(resource.enrolmentLocation))
      programEnrolment.enrolmentLocation = Point.fromResource(resource.enrolmentLocation);

    if (!_.isNil(resource.exitLocation))
      programEnrolment.exitLocation = Point.fromResource(resource.exitLocation);

    return programEnrolment;
  }

  static merge = (childEntityClass) => BaseEntity.mergeOn(mergeMap.get(childEntityClass));

  static associateChild(child, childEntityClass, childResource, entityService) {
    const parentIdField = childEntityClass === EntityApprovalStatus ? "entityUUID" : "programEnrolmentUUID";
    let realmProgramEnrolment = BaseEntity.getParentEntity(
      entityService,
      childEntityClass,
      childResource,
      parentIdField,
      ProgramEnrolment.schema.name
    );
    realmProgramEnrolment = General.pick(realmProgramEnrolment, ["uuid", "latestEntityApprovalStatus"], ["encounters", "checklists", "approvalStatuses"]);
    if (childEntityClass === ProgramEncounter)
      BaseEntity.addNewChild(child, realmProgramEnrolment.encounters);
    else if (childEntityClass === Checklist)
      BaseEntity.addNewChild(child, realmProgramEnrolment.checklists);
    else if (childEntityClass === EntityApprovalStatus) {
        BaseEntity.addNewChild(child, realmProgramEnrolment.approvalStatuses);
        realmProgramEnrolment.latestEntityApprovalStatus = _.maxBy(realmProgramEnrolment.approvalStatuses, 'statusDateTime');
    }
    else throw `${childEntityClass.name} not support by ${ProgramEnrolment.name}`;
    return realmProgramEnrolment;
  }

  nonVoidedEncounters() {
    return this.encounters.filter((enc) => !enc.voided);
  }

  getChecklists() {
    return _.isEmpty(this.checklists) ? [] : this.checklists;
  }

  cloneForEdit() {
    const programEnrolment = new ProgramEnrolment();
    programEnrolment.uuid = this.uuid;
    programEnrolment.program = _.isNil(this.program) ? null : this.program.clone();
    programEnrolment.enrolmentDateTime = this.enrolmentDateTime;
    programEnrolment.programExitDateTime = this.programExitDateTime;
    programEnrolment.programOutcome = _.isNil(this.programOutcome)
      ? null
      : this.programOutcome.clone();
    programEnrolment.individual = this.individual;
    programEnrolment.observations = ObservationsHolder.clone(this.observations);
    programEnrolment.programExitObservations = ObservationsHolder.clone(
      this.programExitObservations
    );
    programEnrolment.encounters = this.encounters;
    programEnrolment.checklists = _.map(this.checklists, (list) => list.clone());
    programEnrolment.enrolmentLocation = _.isNil(this.enrolmentLocation)
      ? null
      : this.enrolmentLocation.clone();
    programEnrolment.exitLocation = _.isNil(this.exitLocation) ? null : this.exitLocation.clone();
    programEnrolment.voided = this.voided;
    programEnrolment.approvalStatuses = this.approvalStatuses;
    return programEnrolment;
  }

  static validationKeys = {
    ENROLMENT_DATE: "ENROLMENT_DATE",
    EXIT_DATE: "EXIT_DATE",
    ENROLMENT_LOCATION: "ENROLMENT_LOCATION",
    EXIT_LOCATION: "EXIT_LOCATION",
  };

  validateEnrolment() {
    const validationResults = [];
    validationResults.push(
      this.validateFieldForEmpty(
        this.enrolmentDateTime,
        ProgramEnrolment.validationKeys.ENROLMENT_DATE
      )
    );
    if (!moment(this.enrolmentDateTime).isValid()) {
      validationResults.push(ValidationResult.failure(ProgramEnrolment.validationKeys.ENROLMENT_DATE, "invalidDateFormat"))
    }
    if (
      !_.isNil(this.enrolmentDateTime) &&
      General.dateAIsBeforeB(this.enrolmentDateTime, this.individual.registrationDate)
    )
      validationResults.push(
        new ValidationResult(
          false,
          ProgramEnrolment.validationKeys.ENROLMENT_DATE,
          "enrolmentDateBeforeRegistrationDate"
        )
      );
    if (!_.isNil(this.enrolmentDateTime) && General.dateIsAfterToday(this.enrolmentDateTime))
      validationResults.push(
        new ValidationResult(
          false,
          ProgramEnrolment.validationKeys.ENROLMENT_DATE,
          "enrolmentDateInFuture"
        )
      );
    return validationResults;
  }

  validateExit() {
    const validationResults = [];
    validationResults.push(
      this.validateFieldForEmpty(
        this.programExitDateTime,
        ProgramEnrolment.validationKeys.EXIT_DATE
      )
    );
    if (!moment(this.programExitDateTime).isValid()) {
      validationResults.push(ValidationResult.failure(ProgramEnrolment.validationKeys.EXIT_DATE, "invalidDateFormat"))
    }
    if (
      !_.isNil(this.programExitDateTime) &&
      General.dateAIsBeforeB(this.programExitDateTime, this.enrolmentDateTime)
    )
      validationResults.push(
        new ValidationResult(
          false,
          ProgramEnrolment.validationKeys.EXIT_DATE,
          "exitDateBeforeEnrolmentDate"
        )
      );
    if (!_.isNil(this.programExitDateTime) && General.dateIsAfterToday(this.programExitDateTime))
      validationResults.push(
        new ValidationResult(false, ProgramEnrolment.validationKeys.EXIT_DATE, "exitDateInFuture")
      );
    return validationResults;
  }

  lastFulfilledEncounter(...encounterTypeNames) {
    return _.chain(this.nonVoidedEncounters())
      .filter((encounter) =>
        _.isEmpty(encounterTypeNames)
          ? encounter
          : _.some(encounterTypeNames, (name) => name === _.get(encounter, "encounterType.name"))
      )
      .filter((encounter) => encounter.encounterDateTime)
      .maxBy((encounter) => encounter.encounterDateTime)
      .value();
  }

  getObservationsForConceptName(conceptNameOrUuid) {
    return _.chain(this.getEncounters(true))
      .map((encounter) => {
        return {
          encounterDateTime: encounter.encounterDateTime,
          obs: encounter.findObservation(conceptNameOrUuid),
        };
      })
      .filter((observation) => observation.obs)
      .map((observation) => {
        return {
          encounterDateTime: observation.encounterDateTime,
          obs: observation.obs.getValue(),
        };
      })
      .value();
  }

  get isActive() {
    return _.isNil(this.programExitDateTime);
  }

  addEncounter(programEncounter) {
    if (!_.some(this.encounters, (encounter) => encounter.uuid === programEncounter.uuid))
      this.encounters.push(programEncounter);
  }

  addEncounters(...programEncounters) {
    _.each(programEncounters, (programEncounter) => this.addEncounter(programEncounter));
  }

  get hasChecklist() {
    return 0 !== this.checklists.length;
  }

  _getEncounters(removeCancelledEncounters) {
    return _.chain(this.nonVoidedEncounters())
      .filter((encounter) => (removeCancelledEncounters ? _.isNil(encounter.cancelDateTime) : true))
      .sortBy((encounter) => moment().diff(encounter.encounterDateTime));
  }

  getEncounters(removeCancelledEncounters) {
    return this._getEncounters(removeCancelledEncounters).value();
  }

  getEncountersOfType(encounterTypeName, removeCancelledEncounters) {
    return this.getEncounters(removeCancelledEncounters).filter(
      (enc) => enc.encounterType.name === encounterTypeName
    );
  }

  allEncounterTypes() {
    return _.uniqBy(
      _.map(this.encounters, (enc) => enc.encounterType),
      "uuid"
    );
  }

  findObservationValueInEntireEnrolment(conceptNameOrUuid, checkInEnrolment) {
    let encounters = _.reverse(this.getEncounters(true));
    let observationWithDate = this._findObservationWithDateFromEntireEnrolment(
      conceptNameOrUuid,
      encounters,
      checkInEnrolment
    );
    if (_.isNil(observationWithDate.observation)) {
      observationWithDate = {
        observation: this.findObservation(conceptNameOrUuid),
        date: this.enrolmentDateTime,
      };
    }
    return _.isNil(observationWithDate.observation)
      ? undefined
      : {
        value: observationWithDate.observation.getReadableValue(),
        date: observationWithDate.date,
      };
  }

  findObservationInEntireEnrolment(conceptNameOrUuid, currentEncounter, latest = false, parentConceptNameOrUuid) {
    let encounters = _.chain(this.getEncounters())
      .filter((enc) => (currentEncounter ? enc.uuid !== currentEncounter.uuid : true))
      .concat(currentEncounter)
      .compact()
      .sortBy((enc) => enc.encounterDateTime)
      .value();
    encounters = latest ? _.reverse(encounters) : encounters;

    return this._findObservationFromEntireEnrolment(conceptNameOrUuid, encounters, true, parentConceptNameOrUuid);
  }

  observationExistsInEntireEnrolment(conceptNameOrUuid, currentEncounter) {
    return !_.isEmpty(this.findObservationInEntireEnrolment(conceptNameOrUuid, currentEncounter));
  }

  findLatestObservationInEntireEnrolment(conceptNameOrUuid, currentEncounter) {
    return this.findObservationInEntireEnrolment(conceptNameOrUuid, currentEncounter, true);
  }

  findLatestObservationFromEncounters(conceptNameOrUuid, currentEncounter, checkInEnrolment = false) {
    const encountersFromEnrolment = _.chain(this.getEncounters())
      .filter((enc) => enc.encounterDateTime)
      .filter((enc) =>
        currentEncounter ? enc.encounterDateTime < currentEncounter.encounterDateTime : true
      )
      .value();

    const encounters = _.chain(currentEncounter).concat(encountersFromEnrolment).compact().value();

    return this._findObservationFromEntireEnrolment(conceptNameOrUuid, encounters, checkInEnrolment);
  }

  findLatestObservationFromPreviousEncounters(conceptNameOrUuid, currentEncounter, parentConceptNameOrUuid) {
    const encounters = _.chain(this.getEncounters())
      .filter((enc) => enc.encounterDateTime)
      .filter((enc) => enc.encounterDateTime < currentEncounter.encounterDateTime)
      .value();
    return this._findObservationFromEntireEnrolment(conceptNameOrUuid, encounters, false, parentConceptNameOrUuid);
  }

  findLatestPreviousEncounterWithValueForConcept(currentEncounter, conceptNameOrUuid, valueConceptName) {
    const encounters = _.chain(this.getEncounters())
      .filter((enc) => enc.encounterDateTime)
      .filter((enc) => enc.encounterDateTime < currentEncounter.encounterDateTime)
      .value();

    for (let i = 0; i < encounters.length; i++) {
      if (this._encounterContainsAnswerConceptName(encounters[i], conceptNameOrUuid, valueConceptName))
        return encounters[i];
    }
    return null;
  }

  _encounterHasObsForConcept(encounter, conceptNameOrUuid, parentConceptNameOrUuid) {
    const observation = encounter.getObservationValue(conceptNameOrUuid, parentConceptNameOrUuid);
    return !_.isNil(observation);
  }

  findLatestPreviousEncounterWithObservationForConcept(currentEncounter, conceptNameOrUuid, parentConceptNameOrUuid) {
    const encounters = _.chain(this.getEncounters())
      .filter((enc) => enc.encounterDateTime)
      .filter((enc) => enc.encounterDateTime < currentEncounter.encounterDateTime)
      .value();

    for (let i = 0; i < encounters.length; i++) {
      if (this._encounterHasObsForConcept(encounters[i], conceptNameOrUuid, parentConceptNameOrUuid)) return encounters[i];
    }
    return null;
  }

  findObservationInLastEncounter(conceptNameOrUuid, currentEncounter, parentConceptNameOrUuid) {
    const lastEncounter = this.findLastEncounterOfType(currentEncounter, _.get(currentEncounter, 'encounterType'));
    return lastEncounter ? lastEncounter.findObservation(conceptNameOrUuid, parentConceptNameOrUuid) : null;
  }

  findLastEncounterOfType(currentEncounter, encounterTypes = []) {
    return this.findNthLastEncounterOfType(currentEncounter, encounterTypes, 0);
  }

  findNthLastEncounterOfType(currentEncounter, encounterTypes = [], n = 0) {
    return _.chain(this.getEncounters())
      .filter((enc) => enc.encounterDateTime)
      .filter((enc) => enc.encounterDateTime < currentEncounter.encounterDateTime)
      .filter((enc) =>
        encounterTypes.some((encounterType) => encounterType === enc.encounterType.name)
      )
      .nth(n)
      .value();
  }

  _encounterContainsAnswerConceptName(encounter, conceptNameOrUuid, valueConceptName) {
    let observation = encounter.findObservation(conceptNameOrUuid);
    return !_.isNil(observation) && this._containsAnswerConceptName(valueConceptName, observation);
  }

  _containsAnswerConceptName(conceptNameOrUuid, observation) {
    const answerConcept = observation.concept.getPossibleAnswerConcept(conceptNameOrUuid);
    const answerUuid = answerConcept && answerConcept.concept.uuid;
    return observation.getValueWrapper().hasValue(answerUuid);
  }

  _findObservationFromEntireEnrolment(conceptNameOrUuid, encounters, checkInEnrolment = true, parentConceptNameOrUuid) {
    return this._findObservationWithDateFromEntireEnrolment(
      conceptNameOrUuid,
      encounters,
      checkInEnrolment,
      parentConceptNameOrUuid
    ).observation;
  }

  _findObservationWithDateFromEntireEnrolment(conceptNameOrUuid, encounters, checkInEnrolment = true, parentConceptNameOrUuid) {
    let observation;
    let encounter;
    for (let i = 0; i < encounters.length; i++) {
      encounter = encounters[i];
      observation = encounters[i].findObservation(conceptNameOrUuid, parentConceptNameOrUuid);
      if (!_.isNil(observation))
        return {observation: observation, date: encounter.encounterDateTime};
    }

    if (checkInEnrolment)
      return {
        observation: this.findObservation(conceptNameOrUuid, parentConceptNameOrUuid),
        date: this.enrolmentDateTime,
      };
    return {};
  }

  getObservationReadableValueInEntireEnrolment(conceptNameOrUuid, programEncounter) {
    let obs = this.findObservationInEntireEnrolment(conceptNameOrUuid, programEncounter);
    return obs ? obs.getReadableValue() : undefined;
  }

  findObservation(conceptNameOrUuid, parentConceptNameOrUuid) {
    const observations = _.isNil(parentConceptNameOrUuid) ? this.observations : this.findGroupedObservation(parentConceptNameOrUuid);
    return _.find(observations, (observation) => {
      return (observation.concept.name === conceptNameOrUuid) || (observation.concept.uuid === conceptNameOrUuid);
    });
  }

  findGroupedObservation(parentConceptNameOrUuid) {
    const groupedObservations = _.find(this.observations, (observation) =>
      (observation.concept.name === parentConceptNameOrUuid) || (observation.concept.uuid === parentConceptNameOrUuid));
    return _.isEmpty(groupedObservations) ? [] : groupedObservations.getValue();
  }

  findExitObservation(conceptNameOrUuid) {
    return _.find(
      this.programExitObservations,
      (observation) => (observation.concept.name === conceptNameOrUuid) || (observation.concept.uuid === conceptNameOrUuid)
    );
  }

  addChecklist(checklist) {
    this.checklists = this.getChecklists()
      .filter((c) => c.uuid !== checklist.uuid)
      .concat([checklist]);
  }

  scheduledEncounters() {
    return _.filter(
      this.getEncounters(true),
      (encounter) => !encounter.encounterDateTime && _.isNil(encounter.cancelDateTime)
    );
  }

  scheduledEncountersOfType(encounterTypeName) {
    return this.scheduledEncounters().filter(
      (scheduledEncounter) => scheduledEncounter.encounterType.name === encounterTypeName
    );
  }

  getAllScheduledVisits(currentEncounter) {
    return _.defaults(this.scheduledEncounters(true), [])
      .filter((encounter) => encounter.uuid !== currentEncounter.uuid)
      .map(_.identity)
      .map(({uuid, name, encounterType, earliestVisitDateTime, maxVisitDateTime}) => ({
        name: name,
        encounterType: encounterType.name,
        earliestDate: earliestVisitDateTime,
        maxDate: maxVisitDateTime,
        uuid: uuid,
      }));
  }

  addObservation(observation) {
    this.observations.push(observation);
  }

  findEncounter(encounterTypeName, encounterName) {
    return this.nonVoidedEncounters().find(function (encounter) {
      return encounter.encounterType.name === encounterTypeName && encounter.name === encounterName;
    });
  }

  numberOfEncountersOfType(encounterTypeName) {
    return _.countBy(this.nonVoidedEncounters(), (encounter) => {
      return encounter.encounterType.name === encounterTypeName;
    }).true;
  }

  hasEncounter(encounterTypeName, encounterName) {
    return !_.isNil(this.findEncounter(encounterTypeName, encounterName));
  }

  hasCompletedEncounterOfType(encounterTypeName) {
    return _.some(
      this.nonVoidedEncounters(),
      (encounter) =>
        encounter.encounterType.name === encounterTypeName && !_.isNil(encounter.encounterDateTime)
    );
  }

  hasEncounterOfType(encounterTypeName) {
    return !_.isNil(
      this.nonVoidedEncounters().find(
        (encounter) => encounter.encounterType.name === encounterTypeName
      )
    );
  }

  hasAnyOfEncounterTypes(encounterTypeNames = []) {
    return encounterTypeNames.some((it) => this.hasEncounterOfType(it));
  }

  hasEncounterWithObservationValueAfterDate(encounterTypeName, afterDate, conceptNameOrUuid, value) {
    const obsAfterDate = _(this.getEncounters())
      .filter((en) => moment(en.encounterDateTime).isAfter(afterDate))
      .filter((en) => en.encounterType.name === encounterTypeName)
      .find((en) => en.getObservationReadableValue(conceptNameOrUuid) === value);
    return !_.isNil(obsAfterDate);
  }

  //get has been taken by the prototype
  getObservationValue(conceptNameOrUuid, parentConceptNameOrUuid) {
    const observationValue = this.findObservation(conceptNameOrUuid, parentConceptNameOrUuid);
    return _.isEmpty(observationValue) ? undefined : observationValue.getValue();
  }

  getObservationReadableValue(conceptNameOrUuid, parentConceptNameOrUuid) {
    const observationValue = this.findObservation(conceptNameOrUuid, parentConceptNameOrUuid);
    return _.isNil(observationValue) ? undefined : observationValue.getReadableValue();
  }

  hasObservation(conceptNameOrUuid) {
    return !_.isNil(this.getObservationValue(conceptNameOrUuid));
  }

  findMediaObservations() {
    return findMediaObservations(
      ObservationsHolder.clone(this.observations),
      ObservationsHolder.clone(this.programExitObservations)
    );
  }

  replaceMediaObservation(originalValue, newValue, conceptUUID) {
    new ObservationsHolder(this.observations).replaceMediaObservation(originalValue, newValue, conceptUUID);
  }

  replaceObservation(originalValue, newValue) {
    new ObservationsHolder(this.observations).updateObservationBasedOnValue(
      originalValue,
      newValue
    );
    new ObservationsHolder(this.programExitObservations).updateObservationBasedOnValue(
      originalValue,
      newValue
    );
  }

  getName() {
    return "ProgramEnrolment";
  }

  getEntityTypeName() {
    return this.program.name;
  }

  isRejectedEntity() {
    return this.latestEntityApprovalStatus && this.latestEntityApprovalStatus.isRejected;
  }

  setLatestEntityApprovalStatus(entityApprovalStatus) {
    this.that.latestEntityApprovalStatus = this.fromObject(entityApprovalStatus);
  }

  toJSON() {
    return {
      uuid: this.uuid,
      program: this.program,
      enrolmentDateTime: this.enrolmentDateTime,
      observations: this.observations,
      programExitDateTime: this.programExitDateTime,
      programExitObservations: this.programExitObservations,
      programOutcome: {type: "ProgramOutcome", optional: true},
      encounters: this.encounters,
      checklists: this.checklists,
      individualUUID: this.individual.uuid,
      voided: this.voided,
      approvalStatuses: this.approvalStatuses
    };
  }
}

export default ProgramEnrolment;
