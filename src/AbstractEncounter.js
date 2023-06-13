import _ from "lodash";
import ValidationResult from "./application/ValidationResult";
import BaseEntity from "./BaseEntity";
import EncounterType from "./EncounterType";
import ObservationsHolder from "./ObservationsHolder";
import General from "./utility/General";
import ResourceUtil from "./utility/ResourceUtil";
import {findMediaObservations} from "./Media";
import Point from "./geo/Point";
import moment from "moment";
import Observation from "./Observation";
import EntityApprovalStatus from "./EntityApprovalStatus";
import SchemaNames from './SchemaNames';
import MergeUtil from "./utility/MergeUtil";

const mergeMap = new Map([
  [SchemaNames.EntityApprovalStatus, "approvalStatuses"]]);

class AbstractEncounter extends BaseEntity {
  static fieldKeys = {
    ENCOUNTER_DATE_TIME: "ENCOUNTER_DATE_TIME",
    COMPLETION_DATE: "COMPLETION_DATE",
  };

  constructor(that = null) {
    super(that);
  }

  get latestEntityApprovalStatus() {
    return _.maxBy(this.approvalStatuses, 'statusDateTime');
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

  get observations() {
    return this.toEntityList("observations", Observation);
  }

  set observations(x) {
    this.that.observations = this.fromEntityList(x);
  }

  get cancelLocation() {
    return this.toEntity("cancelLocation", Point);
  }

  set cancelLocation(x) {
    this.that.cancelLocation = this.fromObject(x);
  }

  get cancelObservations() {
    return this.toEntityList("cancelObservations", Observation);
  }

  set cancelObservations(x) {
    this.that.cancelObservations = this.fromEntityList(x);
  }

  get cancelDateTime() {
    return this.that.cancelDateTime;
  }

  set cancelDateTime(x) {
    this.that.cancelDateTime = x;
  }

  get approvalStatuses() {
    return this.toEntityList("approvalStatuses", EntityApprovalStatus);
  }

  set approvalStatuses(x) {
    this.that.approvalStatuses = this.fromEntityList(x);
  }

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

  static createEmptyInstance(encounter) {
    encounter.voided = false;
    encounter.uuid = General.randomUUID();
    encounter.observations = [];
    encounter.cancelObservations = [];
    encounter.approvalStatuses = [];
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
    encounter.approvalStatuses = this.approvalStatuses;
    return encounter;
  }

  static fromResource(resource, entityService, encounter) {
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
      [AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME]: this.encounterDateTime
    };
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

  replaceMediaObservation(originalValue, newValue, conceptUUID) {
    new ObservationsHolder(this.observations).replaceMediaObservation(originalValue, newValue, conceptUUID);
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

  getEncounterLabel(templateString, {
    conceptService,
    subjectService,
    addressLevelService,
    i18n,
    encounterService
  }) {
    const conceptPattern = /{.*?}/g;
    let identifierTemplateString = templateString;
    _.forEach(templateString.match(conceptPattern), identifier => {
      const value = identifier === '{Date}' ? General.toDisplayDate(this.encounterDateTime) :
        this.getValueForDisplay(identifier.replace(/[{}]/g, ''), {
          conceptService,
          subjectService,
          addressLevelService,
          i18n,
          encounterService
        });
      identifierTemplateString = identifierTemplateString.replace(identifier, value);
    });
    return identifierTemplateString;
  }

  getValueForDisplay(conceptName, {
    conceptService,
    subjectService,
    addressLevelService,
    i18n,
    encounterService
  }) {
    const observation = this.findObservation(conceptName);
    if (_.isNil(observation)) return "";
    const displayValue = Observation.valueForDisplay({
      observation,
      conceptService,
      subjectService,
      addressLevelService,
      i18n,
      encounterService
    });
    return displayValue.displayValue;
  }

  static merge = (childEntityName) => MergeUtil.getMergeFunction(childEntityName, mergeMap);

  get subjectType() {
    return _.get(
      this,
      this.getName() === "Encounter"
        ? "individual.subjectType"
        : "programEnrolment.individual.subjectType"
    );
  }

  setLatestEntityApprovalStatus(entityApprovalStatus) {
    this.that.latestEntityApprovalStatus = this.fromObject(entityApprovalStatus);
  }
}

export default AbstractEncounter;
