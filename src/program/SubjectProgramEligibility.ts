import BaseEntity from "../BaseEntity";
import Individual from "../Individual";
import Program from "../Program";
import Observation from "../Observation";
import General from "../utility/General";
import ResourceUtil from "../utility/ResourceUtil";
import ObservationsHolder from "../ObservationsHolder";
import _ from 'lodash';

class SubjectProgramEligibility extends BaseEntity {
    static schema = {
        name: "SubjectProgramEligibility",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            subject: "Individual",
            program: "Program",
            checkDate: "date",
            eligible: {type: "bool", default: false},
            observations: {type: "list", objectType: "Observation"},
            voided: {type: "bool", default: false},
        },
    };

    uuid: string;
    subject: Individual;
    program: Program;
    checkDate: Date;
    eligible: boolean;
    voided: boolean;
    observations: Observation[];

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
}

export default SubjectProgramEligibility;
