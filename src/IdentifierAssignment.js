import ResourceUtil from './utility/ResourceUtil';
import General from './utility/General';
import BaseEntity from './BaseEntity';
import Individual from './Individual';
import ProgramEnrolment from './ProgramEnrolment';
import IdentifierSource from './IdentifierSource';
import _ from 'lodash';
import {AuditFields, mapAuditFields} from "./utility/AuditUtil";

export default class IdentifierAssignment extends BaseEntity {
    static schema = {
        name: "IdentifierAssignment",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            identifierSource: "IdentifierSource",
            identifier: "string",
            assignmentOrder: "double",
            individual: {type: "Individual", optional: true},
            voided: {type: "bool", default: false},
            programEnrolment: {type: "ProgramEnrolment", optional: true},
            used: {type: "bool", default: false, optional: false}, // required to maintain state for deleted (https://github.com/avniproject/avni-client/issues/1092#issuecomment-1767632083) and draft (https://github.com/avniproject/avni-client/issues/1356) entities
            ...AuditFields
        },
    };

    constructor(that = null) {
        super(that);
    }

    get identifierSource() {
        return this.toEntity("identifierSource", IdentifierSource);
    }

    set identifierSource(x) {
        this.that.identifierSource = this.fromObject(x);
    }

    get identifier() {
        return this.that.identifier;
    }

    set identifier(x) {
        this.that.identifier = x;
    }

    get assignmentOrder() {
        return this.that.assignmentOrder;
    }

    set assignmentOrder(x) {
        this.that.assignmentOrder = x;
    }

    get individual() {
        return this.toEntity("individual", Individual);
    }

    set individual(x) {
        this.that.individual = this.fromObject(x);
    }

    get programEnrolment() {
        return this.toEntity("programEnrolment", ProgramEnrolment);
    }

    set programEnrolment(x) {
        this.that.programEnrolment = this.fromObject(x);
    }

    get used() {
        return this.that.used;
    }

    set used(x) {
        this.that.used = x;
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

    static fromResource(identifierAssignmentResource, entityService) {
        const identifierAssignment = General.assignFields(
            identifierAssignmentResource,
            new IdentifierAssignment(),
            ["uuid", "identifier", "assignmentOrder", "voided", "used"]
        );
        identifierAssignment.identifierSource = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(identifierAssignmentResource, "identifierSourceUUID"),
            IdentifierSource.schema.name
        );
        identifierAssignment.individual = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(identifierAssignmentResource, "individualUUID"),
            Individual.schema.name
        );
        identifierAssignment.programEnrolment = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(identifierAssignmentResource, "programEnrolmentUUID"),
            ProgramEnrolment.schema.name
        );

        mapAuditFields(identifierAssignment, identifierAssignmentResource);
        return identifierAssignment;
    }

    get toResource() {
        const resource = _.pick(this, ["uuid", "identifier", "assignmentOrder", "voided", "used"]);
        resource.individualUUID = this.individual ? this.individual.uuid : null;
        resource.programEnrolmentUUID = this.programEnrolment ? this.programEnrolment.uuid : null;
        return resource;
    }

    clone() {
        let identifierAssignment = new IdentifierAssignment();
        identifierAssignment.uuid = this.uuid;
        identifierAssignment.identifierSource = this.identifierSource.clone();
        identifierAssignment.identifier = this.identifier;
        identifierAssignment.assignmentOrder = this.assignmentOrder;
        identifierAssignment.individual = this.individual && this.individual.clone();
        identifierAssignment.programEnrolment = this.programEnrolment && this.programEnrolment.clone();
        identifierAssignment.voided = this.voided;
        return identifierAssignment;
    }
}
