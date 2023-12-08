import Individual from "./Individual";
import ResourceUtil from "./utility/ResourceUtil";
import AbstractEncounter from "./AbstractEncounter";
import _ from "lodash";
import ValidationResult from "./application/ValidationResult";
import G from "./utility/General";
import General from "./utility/General";
import EncounterType from "./EncounterType";
import Point from "./geo/Point";
import EntityApprovalStatus from "./EntityApprovalStatus";
import SchemaNames from "./SchemaNames";
import BaseEntity from "./BaseEntity";

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
      approvalStatuses: {type: "list", objectType: "EntityApprovalStatus"},
      latestEntityApprovalStatus: {type: "EntityApprovalStatus", optional: true}  //Reporting purposes
    },
  };

   constructor(that = null) {
    super(that);
  }

  get individual() {
      return this.toEntity("individual", Individual);
  }

  set individual(x) {
      this.that.individual = this.fromObject(x);
  }

  static validationKeys = {
    ENCOUNTER_LOCATION: "ENCOUNTER_LOCATION",
  };

  static create() {
    let encounter = this.createEmptyInstance();
    encounter.encounterType = EncounterType.create();
    return encounter;
  }

  static fromResource(resource, entityService) {
    const encounter = super.fromResource(resource, entityService, new Encounter());
    encounter.individual = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "individualUUID"),
      Individual.schema.name
    );
    return encounter;
  }

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

  static createEmptyInstance() {
    return AbstractEncounter.createEmptyInstance(new Encounter());
  }

  static createScheduled(encounterType, individual) {
    const encounter = Encounter.createEmptyInstance();
    encounter.encounterType = encounterType;
    encounter.individual = individual;
    encounter.encounterDateTime = null;
    return encounter;
  }

  getAllScheduledVisits() {
    return this.individual.getAllScheduledVisits(this);
  }

  static associateChild(child, childEntityClass, childResource, entityService) {
    let realmEncounter = BaseEntity.getParentEntity(
      entityService,
      childEntityClass,
      childResource,
      "entityUUID",
      Encounter.schema.name
    );
    realmEncounter = General.pick(realmEncounter, ["uuid", "latestEntityApprovalStatus"], ["approvalStatuses"]);
    if (childEntityClass === EntityApprovalStatus) {
      BaseEntity.addNewChild(child, realmEncounter.approvalStatuses);
      realmEncounter.latestEntityApprovalStatus = _.maxBy(realmEncounter.approvalStatuses, 'statusDateTime');
    }
    return realmEncounter;
  }

    getSchemaName() {
        return SchemaNames.Encounter;
    }
}

export default Encounter;
