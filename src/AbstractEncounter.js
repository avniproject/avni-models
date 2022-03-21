import _ from "lodash";
import ValidationResult from "./application/ValidationResult";
import BaseEntity from "./BaseEntity";
import EncounterType from "./EncounterType";
import ObservationsHolder from "./ObservationsHolder";
import General from "./utility/General";
import ResourceUtil from "./utility/ResourceUtil";
import { findMediaObservations } from "./Media";
import Point from "./geo/Point";
import moment from "moment";

class AbstractEncounter extends BaseEntity {
  static fieldKeys = {
    ENCOUNTER_DATE_TIME: "ENCOUNTER_DATE_TIME",
    COMPLETION_DATE: "COMPLETION_DATE",
  };

  validate() {
    return _.isNil(this.encounterDateTime)
      ? [
          new ValidationResult(
            false,
            AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME,
            "emptyValidationMessage"
          ),
        ]
      : [ValidationResult.successful(AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME)];
  }

  get toResource() {
    const resource = _.pick(this, ["uuid", "voided"]);
    resource.encounterTypeUUID = this.encounterType.uuid;
    resource.observations = _.map(this.observations, "toResource");
    if (!_.isNil(this.encounterDateTime))
      resource.encounterDateTime = moment(this.encounterDateTime).format();
    resource.name = this.name;
    if (!_.isNil(this.earliestVisitDateTime))
      resource.earliestVisitDateTime = moment(this.earliestVisitDateTime).format();
    if (!_.isNil(this.maxVisitDateTime))
      resource.maxVisitDateTime = moment(this.maxVisitDateTime).format();
    if (!_.isNil(this.cancelDateTime))
      resource.cancelDateTime = moment(this.cancelDateTime).format();
    resource.cancelObservations = _.map(this.cancelObservations, "toResource");
    if (!_.isNil(this.encounterLocation)) {
      resource.encounterLocation = this.encounterLocation.toResource;
    }
    if (!_.isNil(this.cancelLocation)) {
      resource.cancelLocation = this.cancelLocation.toResource;
    }
    return resource;
  }

  static createEmptyInstance() {
    const encounter = new this();
    encounter.voided = false;
    encounter.uuid = General.randomUUID();
    encounter.observations = [];
    encounter.cancelObservations = [];
    encounter.encounterDateTime = new Date();
    encounter.voided = false;
    return encounter;
  }

  getRealEventDate() {
    return _.isNil(this.encounterDateTime) ? this.earliestVisitDateTime : this.encounterDateTime;
  }

  cloneForEdit() {
    const encounter = new this.constructor();
    encounter.uuid = this.uuid;
    encounter.encounterType = _.isNil(this.encounterType) ? null : this.encounterType.clone();
    encounter.encounterDateTime = this.encounterDateTime;
    encounter.observations = ObservationsHolder.clone(this.observations);
    encounter.voided = this.voided;
    encounter.name = this.name;
    encounter.earliestVisitDateTime = this.earliestVisitDateTime;
    encounter.maxVisitDateTime = this.maxVisitDateTime;
    encounter.cancelDateTime = this.cancelDateTime;
    encounter.cancelObservations = ObservationsHolder.clone(this.cancelObservations);
    encounter.encounterLocation = _.isNil(this.encounterLocation)
      ? null
      : this.encounterLocation.clone();
    encounter.cancelLocation = _.isNil(this.cancelLocation) ? null : this.cancelLocation.clone();
    encounter.latestEntityApprovalStatus = this.latestEntityApprovalStatus;
    return encounter;
  }

  static fromResource(resource, entityService) {
    const encounter = new this();
    General.assignFields(
      resource,
      encounter,
      ["uuid", "voided"],
      ["encounterDateTime"],
      ["observations", "cancelObservations"],
      entityService
    );
    encounter.encounterType = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "encounterTypeUUID"),
      EncounterType.schema.name
    );

    General.assignDateFields(
      ["earliestVisitDateTime", "maxVisitDateTime", "cancelDateTime"],
      resource,
      encounter
    );
    encounter.name = resource.name;

    if (!_.isNil(resource.encounterLocation))
      encounter.encounterLocation = Point.fromResource(resource.encounterLocation);

    if (!_.isNil(resource.cancelLocation))
      encounter.cancelLocation = Point.fromResource(resource.cancelLocation);

    return encounter;
  }

  getEncounterDateValues() {
    return {
      [AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME]: this.encounterDateTime,
      [ProgramEncounter.fieldKeys.SCHEDULED_DATE_TIME]: this.earliestVisitDateTime,
      [ProgramEncounter.fieldKeys.MAX_DATE_TIME]: this.maxVisitDateTime,
    };
  }

  findObservation(conceptNameOrUuid, parentConceptNameOrUuid) {
    const observations = _.isNil(parentConceptNameOrUuid) ? this.observations : this.findGroupedObservation(parentConceptNameOrUuid);
    return _.find(observations, (observation) => {
      return (observation.concept.name === conceptNameOrUuid) || (observation.concept.uuid === conceptNameOrUuid);
    });
  }

  findGroupedObservation(parentConceptNameOrUuid) {
    const groupedObservations =_.find(this.observations, (observation) =>
        (observation.concept.name === parentConceptNameOrUuid) || (observation.concept.uuid === parentConceptNameOrUuid));
    return _.isEmpty(groupedObservations) ? [] : groupedObservations.getValue();
  }

  findCancelEncounterObservation(conceptNameOrUuid) {
    return _.find(this.cancelObservations, (observation) => {
      return (observation.concept.name === conceptNameOrUuid) || (observation.concept.uuid === conceptNameOrUuid);
    });
  }

  findCancelEncounterObservationReadableValue(conceptNameOrUuid) {
    const observationForConcept = this.findCancelEncounterObservation(conceptNameOrUuid);
    return _.isEmpty(observationForConcept)
      ? observationForConcept
      : observationForConcept.getReadableValue();
  }

  getObservationValue(conceptNameOrUuid, parentConceptNameOrUuid) {
    const observationForConcept = this.findObservation(conceptNameOrUuid, parentConceptNameOrUuid);
    return _.isEmpty(observationForConcept)
      ? observationForConcept
      : observationForConcept.getValue();
  }

  getObservationReadableValue(conceptNameOrUuid, parentConceptNameOrUuid) {
    const observationForConcept = this.findObservation(conceptNameOrUuid, parentConceptNameOrUuid);
    return _.isEmpty(observationForConcept)
      ? observationForConcept
      : observationForConcept.getReadableValue();
  }

  isCancellable() {
    return !this.hasBeenEdited() && !this.isCancelled();
  }

  updateSchedule(scheduledVisit) {
    this.earliestVisitDateTime = scheduledVisit.earliestDate;
    this.maxVisitDateTime = scheduledVisit.maxDate;
    this.name = scheduledVisit.name;
    return this;
  }

  getObservations() {
    return _.isEmpty(this.observations) ? this.cancelObservations : this.observations;
  }

  addObservation(obs) {
    this.observations.push(obs);
  }

  hasBeenEdited() {
    return !!this.encounterDateTime;
  }

  isCancelled() {
    return !!this.cancelDateTime;
  }

  isScheduled() {
    return _.isNil(this.encounterDateTime) && _.isNil(this.cancelDateTime);
  }

  hasObservation(conceptNameOrUuid) {
    return !_.isNil(this.getObservationValue(conceptNameOrUuid));
  }

  findMediaObservations() {
    return findMediaObservations(
      ObservationsHolder.clone(this.observations),
      ObservationsHolder.clone(this.cancelObservations)
    );
  }

  replaceObservation(originalValue, newValue) {
    new ObservationsHolder(this.observations).updateObservationBasedOnValue(
      originalValue,
      newValue
    );
    new ObservationsHolder(this.cancelObservations).updateObservationBasedOnValue(
      originalValue,
      newValue
    );
  }

  getEntityTypeName() {
    return this.encounterType.name;
  }

  isRejectedEntity() {
    return this.latestEntityApprovalStatus && this.latestEntityApprovalStatus.isRejected;
  }

  get subjectType() {
    return _.get(
      this,
      this.getName() === "Encounter"
        ? "individual.subjectType"
        : "programEnrolment.individual.subjectType"
    );
  }
}

export default AbstractEncounter;
