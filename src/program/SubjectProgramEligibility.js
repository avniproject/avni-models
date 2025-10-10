import BaseEntity from "../BaseEntity";
import Individual from "../Individual";
import Program from "../Program";
import Observation from "../Observation";
import General from "../utility/General";
import ResourceUtil from "../utility/ResourceUtil";
import ObservationsHolder from "../ObservationsHolder";
import _ from 'lodash';
import SchemaNames from "../SchemaNames";
import {AuditFields, mapAuditFields} from "../utility/AuditUtil";

class SubjectProgramEligibility extends BaseEntity {
    static schema = {
        name: SchemaNames.SubjectProgramEligibility,
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            subject: { type: 'object', objectType: 'Individual' },
            program: { type: 'object', objectType: 'Program' },
            checkDate: "date",
            eligible: {type: "bool", default: false},
            observations: {type: "list", objectType: "Observation"},
            voided: {type: "bool", default: false},
            ...AuditFields
        },
    };

    constructor(that = null) {
        super(that);
    }

    get subject() {
        return this.toEntity("subject", Individual);
    }

    set subject(x) {
        this.that.subject = this.fromObject(x);
    }

    get program() {
        return this.toEntity("program", Program);
    }

    set program(x) {
        this.that.program = this.fromObject(x);
    }

    get checkDate() {
        return this.that.checkDate;
    }

    set checkDate(x) {
        this.that.checkDate = x;
    }

    get eligible() {
        return this.that.eligible;
    }

    set eligible(x) {
        this.that.eligible = x;
    }

    get observations() {
        return this.toEntityList("observations", Observation);
    }

    set observations(x) {
        this.that.observations = this.fromEntityList(x);
    }

    get createdBy() {
        return this.that.createdBy;
    }

    set createdBy(x) {
        this.that.createdBy = x;
    }

    get lastModifiedBy() {
        return this.that.lastModifiedBy;
    }

    set lastModifiedBy(x) {
        this.that.lastModifiedBy = x;
    }

    get createdByUUID() {
        return this.that.createdByUUID;
    }

    set createdByUUID(x) {
        this.that.createdByUUID = x;
    }

    get lastModifiedByUUID() {
        return this.that.lastModifiedByUUID;
    }

    set lastModifiedByUUID(x) {
        this.that.lastModifiedByUUID = x;
    }

    static createEmptyInstance(program, subject) {
        const subjectProgramEligibility = new SubjectProgramEligibility();
        subjectProgramEligibility.checkDate = new Date();
        subjectProgramEligibility.uuid = General.randomUUID();
        subjectProgramEligibility.observations = [];
        subjectProgramEligibility.program = program;
        subjectProgramEligibility.subject = subject;
        return subjectProgramEligibility;
    }

    get toResource() {
        const resource = _.pick(this, ["uuid", "voided", "eligible"]);
        resource.subjectUUID = this.subject.uuid;
        resource.programUUID = this.program.uuid;
        resource.checkDate = General.isoFormat(this.checkDate);
        resource["observations"] = [];
        this.observations.forEach((obs) => {
            resource["observations"].push(obs.toResource);
        });
        return resource;
    }

    get eligibilityString() {
        return this.eligible ? 'yes' : 'no';
    }

    static fromResource(resource, entityService) {
        const program = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "programUUID"),
            Program.schema.name
        );
        const subject = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "subjectUUID"),
            Individual.schema.name
        );
        const subjectProgramEligibility = General.assignFields(
            resource,
            new SubjectProgramEligibility(),
            ["uuid", "voided", "eligible"],
            ["checkDate"],
            ["observations"],
            entityService
        );
        subjectProgramEligibility.program = program;
        subjectProgramEligibility.subject = subject;
        mapAuditFields(subjectProgramEligibility, resource);
        return subjectProgramEligibility;
    }

    static createNew(subjectProgramEligibilityStatus, entityService) {
        const subjectProgramEligibility = new SubjectProgramEligibility();
        subjectProgramEligibility.uuid = General.randomUUID();
        this.buildSubjectProgramEligibility(subjectProgramEligibilityStatus, subjectProgramEligibility, entityService);
        return subjectProgramEligibility;
    }

    static updateExisting(subjectProgramEligibilityStatus, olderSubjectProgramEligibility, entityService) {
        const subjectProgramEligibility = olderSubjectProgramEligibility.cloneForEdit();
        this.buildSubjectProgramEligibility(subjectProgramEligibilityStatus, subjectProgramEligibility, entityService);
        return subjectProgramEligibility;
    }

    static buildSubjectProgramEligibility(status, subjectProgramEligibility, entityService) {
        const program = entityService.findByKey("uuid", status.programUUID, Program.schema.name);
        const subject = entityService.findByKey("uuid", status.subjectUUID, Individual.schema.name);
        subjectProgramEligibility.program = program;
        subjectProgramEligibility.subject = subject;
        subjectProgramEligibility.eligible = status.eligible;
        subjectProgramEligibility.checkDate = new Date();
    }

    static buildFromSubjectProgramEligibilityStatus(subjectProgramEligibilityStatus, olderSubjectProgramEligibility, entityService) {
        return _.isNil(olderSubjectProgramEligibility) ?
            this.createNew(subjectProgramEligibilityStatus, entityService) :
            this.updateExisting(subjectProgramEligibilityStatus, olderSubjectProgramEligibility, entityService)
    }

    cloneForEdit() {
        const subjectProgramEligibility = new SubjectProgramEligibility();
        subjectProgramEligibility.uuid = this.uuid;
        subjectProgramEligibility.subject = this.subject;
        subjectProgramEligibility.program = this.program;
        subjectProgramEligibility.checkDate = this.checkDate;
        subjectProgramEligibility.eligible = this.eligible;
        subjectProgramEligibility.voided = this.voided;
        subjectProgramEligibility.observations = ObservationsHolder.clone(this.observations);
        return subjectProgramEligibility;
    }

    getObservationReadableValue(conceptNameOrUuid, parentConceptNameOrUuid) {
        const observationForConcept = this.findObservation(conceptNameOrUuid, parentConceptNameOrUuid);
        return _.isEmpty(observationForConcept)
            ? observationForConcept
            : observationForConcept.getReadableValue();
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
}

export default SubjectProgramEligibility;
