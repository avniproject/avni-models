import General from "./utility/General";
import ResourceUtil from "./utility/ResourceUtil";
import ProgramEnrolment from "./ProgramEnrolment";
import AbstractEncounter from "./AbstractEncounter";
import _ from "lodash";
import ValidationResult from "./application/ValidationResult";
import EntityApprovalStatus from "./EntityApprovalStatus";
import SchemaNames from "./SchemaNames";
import BaseEntity from "./BaseEntity";
import {AuditFields, updateAuditFields} from "./utility/AuditUtil";

class ProgramEncounter extends AbstractEncounter {
    static fieldKeys = {
        SCHEDULED_DATE_TIME: "SCHEDULED_DATE_TIME",
        MAX_DATE_TIME: "MAX_DATE_TIME",
    };

    static validationKeys = {
        ENCOUNTER_LOCATION: "ENCOUNTER_LOCATION",
        CANCEL_LOCATION: "CANCEL_LOCATION",
    };

    static schema = {
        name: SchemaNames.ProgramEncounter,
        primaryKey: "uuid",
        properties: {
            uuid: {type: "string"},
            name: {type: "string", optional: true},
            encounterType: {type: "EncounterType"},
            earliestVisitDateTime: {type: "date", optional: true},
            maxVisitDateTime: {type: "date", optional: true},
            encounterDateTime: {type: "date", optional: true},
            programEnrolment: SchemaNames.ProgramEnrolment,
            observations: {type: "list", objectType: "EmbeddedObservation"},
            cancelDateTime: {type: "date", optional: true},
            cancelObservations: {type: "list", objectType: "EmbeddedObservation"},
            encounterLocation: {type: SchemaNames.EmbeddedPoint, optional: true},
            cancelLocation: {type: SchemaNames.EmbeddedPoint, optional: true},
            voided: {type: "bool", default: false},
            approvalStatuses: {type: "list", objectType: "EntityApprovalStatus"},
            latestEntityApprovalStatus: {type: "EntityApprovalStatus", optional: true},  //Reporting purposes
            ...AuditFields,
            filledBy: {type: "string", optional: true},
            filledByUUID: {type: "string", optional: true}
        },
    };

    constructor(that = null) {
        super(that);
    }

    get programEnrolment() {
        return this.toEntity("programEnrolment", ProgramEnrolment);
    }

    set programEnrolment(x) {
        this.that.programEnrolment = this.fromObject(x);
    }

    static fromResource(resource, entityService) {
        const programEncounter = AbstractEncounter.fromResource(resource, entityService, new ProgramEncounter());
        programEncounter.programEnrolment = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "programEnrolmentUUID"),
            ProgramEnrolment.schema.name
        );
        return programEncounter;
    }

    get toResource() {
        const resource = super.toResource;
        resource.programEnrolmentUUID = this.programEnrolment.uuid;
        return resource;
    }

    cloneForEdit() {
        const encounter = super.cloneForEdit();
        encounter.programEnrolment = this.programEnrolment;
        return encounter;
    }

    validate() {
        const validationResults = super.validate();
        if (
            !_.isNil(this.encounterDateTime) &&
            (General.dateAIsBeforeB(this.encounterDateTime, this.programEnrolment.enrolmentDateTime) ||
                General.dateAIsAfterB(this.encounterDateTime, this.programEnrolment.programExitDateTime))
        )
            validationResults.push(
                new ValidationResult(
                    false,
                    AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME,
                    "encounterDateNotInBetweenEnrolmentAndExitDate"
                )
            );
        if (!_.isNil(this.encounterDateTime) && General.dateIsAfterToday(this.encounterDateTime))
            validationResults.push(
                new ValidationResult(
                    false,
                    AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME,
                    "encounterDateInFuture"
                )
            );
        return validationResults;
    }

    static createEmptyInstance() {
        return AbstractEncounter.createEmptyInstance(new ProgramEncounter());
    }

    static createScheduled(encounterType, programEnrolment) {
        const programEncounter = ProgramEncounter.createEmptyInstance();
        programEncounter.encounterType = encounterType;
        programEncounter.programEnrolment = programEnrolment;
        programEncounter.encounterDateTime = null;
        return programEncounter;
    }

    getAllScheduledVisits() {
        return this.programEnrolment.getAllScheduledVisits(this);
    }

    getName() {
        return "ProgramEncounter";
    }

    findObservationInEntireEnrolment(conceptNameOrUuid) {
        return this.programEnrolment.findObservationInEntireEnrolment(conceptNameOrUuid);
    }

    findLatestObservationInEntireEnrolment(conceptNameOrUuid, currentEncounter) {
        return this.programEnrolment.findLatestObservationInEntireEnrolment(
            conceptNameOrUuid,
            currentEncounter
        );
    }

    observationExistsInEntireEnrolment(conceptNameOrUuid) {
        return !_.isNil(this.programEnrolment.findObservationInEntireEnrolment(conceptNameOrUuid));
    }

    get individual() {
        return this.programEnrolment.individual;
    }

    toJSON() {
        return {
            uuid: this.uuid,
            name: this.name,
            encounterType: this.encounterType,
            earliestVisitDateTime: this.earliestVisitDateTime,
            maxVisitDateTime: this.maxVisitDateTime,
            encounterDateTime: this.encounterDateTime,
            programEnrolmentUUID: this.programEnrolment.uuid,
            observations: this.observations,
            approvalStatuses: this.approvalStatuses,
            voided: this.voided
        };
    }

    getEncounterDateValues() {
        return {
            [AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME]: this.encounterDateTime,
            [ProgramEncounter.fieldKeys.SCHEDULED_DATE_TIME]: this.earliestVisitDateTime,
            [ProgramEncounter.fieldKeys.MAX_DATE_TIME]: this.maxVisitDateTime
        }
    }

    static associateChild(child, childEntityClass, childResource, entityService) {
        let realmProgramEncounter = BaseEntity.getParentEntity(
            entityService,
            childEntityClass,
            childResource,
            "entityUUID",
            ProgramEncounter.schema.name
        );
        realmProgramEncounter = General.pick(realmProgramEncounter, ["uuid", "latestEntityApprovalStatus"], ["approvalStatuses"]);
        if (childEntityClass === EntityApprovalStatus) {
            BaseEntity.addNewChild(child, realmProgramEncounter.approvalStatuses);
            realmProgramEncounter.latestEntityApprovalStatus = _.maxBy(realmProgramEncounter.approvalStatuses, 'statusDateTime');
        }
        return realmProgramEncounter;
    }

    setLatestEntityApprovalStatus(entityApprovalStatus) {
        this.that.latestEntityApprovalStatus = this.fromObject(entityApprovalStatus);
    }

    getSchemaName() {
        return SchemaNames.ProgramEncounter;
    }
}

export default ProgramEncounter;
