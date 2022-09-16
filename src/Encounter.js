import Individual from "./Individual";
import ResourceUtil from "./utility/ResourceUtil";
import AbstractEncounter from "./AbstractEncounter";
import _ from "lodash";
import ValidationResult from "./application/ValidationResult";
import G from "./utility/General";
import EncounterType from "./EncounterType";
import Point from "./geo/Point";
import EntityApprovalStatus from "./EntityApprovalStatus";
import SchemaNames from "./SchemaNames";

class Encounter extends AbstractEncounter {
  static schema = {
    name: SchemaNames.Encounter,
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      encounterType: "EncounterType",
      encounterDateTime: { type: "date", optional: true },
      individual: SchemaNames.Individual,
      observations: { type: "list", objectType: "Observation" },
      encounterLocation: { type: "Point", optional: true },
      name: { type: "string", optional: true },
      earliestVisitDateTime: { type: "date", optional: true },
      maxVisitDateTime: { type: "date", optional: true },
      cancelDateTime: { type: "date", optional: true },
      cancelObservations: { type: "list", objectType: "Observation" },
      cancelLocation: { type: "Point", optional: true },
      voided: { type: "bool", default: false },
      latestEntityApprovalStatus: {type: "EntityApprovalStatus", optional: true},
    },
  };

   constructor(that = null) {
    super(that);
  }

  get individual() {
      return this.toEntity("individual", Individual);
  }

  set individual(x) {
      this.that.individual = x && x.that;
  }

  static validationKeys = {
    ENCOUNTER_LOCATION: "ENCOUNTER_LOCATION",
  };

  static create() {
    let encounter = super.createEmptyInstance();
    encounter.encounterType = EncounterType.create();
    return encounter;
  }

  static fromResource(resource, entityService) {
    const encounter = super.fromResource(resource, entityService);
    encounter.individual = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "individualUUID"),
      Individual.schema.name
    );
    return encounter;
  }

  static parentAssociations = () => new Map([[Individual, "individualUUID"]]);

  get toResource() {
    const resource = super.toResource;
    resource.individualUUID = this.individual.uuid;
    return resource;
  }

  cloneForEdit() {
    const encounter = super.cloneForEdit();
    encounter.individual = this.individual;
    return encounter;
  }

  validate() {
    const validationResults = super.validate();
    if (
      !_.isNil(this.encounterDateTime) &&
      G.dateAIsBeforeB(this.encounterDateTime, this.individual.registrationDate)
    )
      validationResults.push(
        new ValidationResult(
          false,
          AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME,
          "encounterDateBeforeRegistrationDate"
        )
      );
    if (!_.isNil(this.encounterDateTime) && G.dateIsAfterToday(this.encounterDateTime))
      validationResults.push(
        new ValidationResult(
          false,
          AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME,
          "encounterDateInFuture"
        )
      );
    return validationResults;
  }

  getName() {
    return "Encounter";
  }

  static createScheduled(encounterType, individual) {
    const programEncounter = Encounter.createEmptyInstance();
    programEncounter.encounterType = encounterType;
    programEncounter.individual = individual;
    programEncounter.encounterDateTime = null;
    return programEncounter;
  }

  getAllScheduledVisits() {
    return this.individual.getAllScheduledVisits(this);
  }
}

export default Encounter;
