import ObservationsHolder from "../ObservationsHolder";
import Encounter from '../Encounter';


class DraftEncounter {
  static schema = {
    name: "DraftEncounter",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      encounterType: "EncounterType",
      encounterDateTime: { type: "date", optional: true },
      individual: "Individual",
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

  static create(encounter) {
    const draftEncounter = new DraftEncounter();
    draftEncounter.uuid = encounter.uuid;
    draftEncounter.encounterType = encounter.encounterType;
    draftEncounter.encounterDateTime = encounter.encounterDateTime;
    draftEncounter.individual = encounter.individual;
    draftEncounter.observations = encounter.observations;
    draftEncounter.encounterLocation = encounter.encounterLocation;
    draftEncounter.name = encounter.name;
    draftEncounter.earliestVisitDateTime = encounter.earliestVisitDateTime;
    draftEncounter.maxVisitDateTime = encounter.maxVisitDateTime;
    draftEncounter.cancelDateTime = encounter.cancelDateTime;
    draftEncounter.cancelObservations = encounter.cancelObservations;
    draftEncounter.cancelLocation = encounter.cancelLocation;
    draftEncounter.voided = encounter.voided;
    draftEncounter.latestEntityApprovalStatus = encounter.latestEntityApprovalStatus;
    draftEncounter.registrationLocation = encounter.registrationLocation;
    draftEncounter.updatedOn = new Date();
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
    encounter.latestEntityApprovalStatus = this.latestEntityApprovalStatus;
    encounter.registrationLocation = this.registrationLocation;
    return encounter;
  }
}

export default DraftEncounter;
