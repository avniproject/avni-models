import General from "../utility/General";
import ResourceUtil from "../utility/ResourceUtil";
import BaseEntity from "../BaseEntity";
import Individual from "../Individual";
import _ from "lodash";
import IndividualRelationshipType from "./IndividualRelationshipType";
import Observation from "../Observation";
import SchemaNames from "../SchemaNames";
import {AuditFields, mapAuditFields} from "../utility/AuditUtil";

class IndividualRelationship extends BaseEntity {
    static schema = {
        name: SchemaNames.IndividualRelationship,
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            relationship: "IndividualRelationshipType",
            individualA: "Individual",
            individualB: "Individual",
            enterDateTime: {type: "date", optional: true},
            exitDateTime: {type: "date", optional: true},
            exitObservations: {type: "list", objectType: "Observation"},
            voided: {type: "bool", default: false},
            ...AuditFields
        },
    };

    get relationship() {
        return this.toEntity("relationship", IndividualRelationshipType);
    }

    set relationship(x) {
        this.that.relationship = this.fromObject(x);
    }

    get individualA() {
        return this.toEntity("individualA", Individual);
    }

    set individualA(x) {
        this.that.individualA = this.fromObject(x);
    }

    get individualB() {
        return this.toEntity("individualB", Individual);
    }

    set individualB(x) {
        this.that.individualB = this.fromObject(x);
    }

    get enterDateTime() {
        return this.that.enterDateTime;
    }

    set enterDateTime(x) {
        this.that.enterDateTime = x;
    }

    get exitDateTime() {
        return this.that.exitDateTime;
    }

    set exitDateTime(x) {
        this.that.exitDateTime = x;
    }

    get exitObservations() {
        return this.toEntityList("exitObservations", Observation);
    }

    set exitObservations(x) {
        this.that.exitObservations = this.fromEntityList(x);
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

    static createEmptyInstance() {
        const individualRelationship = new IndividualRelationship();
        individualRelationship.uuid = General.randomUUID();
        individualRelationship.individualA = Individual.createEmptyInstance();
        individualRelationship.individualB = Individual.createEmptyInstance();
        individualRelationship.relationship = IndividualRelationshipType.createEmptyInstance();
        return individualRelationship;
    }

    get toResource() {
        const resource = _.pick(this, ["uuid"]);
        resource["individualAUUID"] = this.individualA.uuid;
        resource["individualBUUID"] = this.individualB.uuid;
        resource["relationshipTypeUUID"] = this.relationship.uuid;
        resource["voided"] = this.voided;
        resource.enterDateTime = General.isoFormat(this.enterDateTime);
        resource.exitDateTime = General.isoFormat(this.exitDateTime);

        return resource;
    }

    static fromResource(resource, entityService) {
        const relationshipType = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "relationshipTypeUUID"),
            IndividualRelationshipType.schema.name
        );
        const individualA = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "individualAUUID"),
            Individual.schema.name
        );
        const individualB = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "individualBUUID"),
            Individual.schema.name
        );

        const individualRelationship = General.assignFields(
            resource,
            new IndividualRelationship(),
            ["uuid", "voided"],
            ["enterDateTime", "exitDateTime"],
            [],
            entityService
        );
        individualRelationship.relationship = relationshipType;
        individualRelationship.individualA = individualA;
        individualRelationship.individualB = individualB;
        mapAuditFields(individualRelationship, resource);
        return individualRelationship;
    }

    static create(individualRelative, relationshipType) {
        const individualRelationship = IndividualRelationship.createEmptyInstance();
        individualRelationship.relationship = relationshipType;
        if (individualRelative.relation.uuid === relationshipType.individualBIsToARelation.uuid) {
            individualRelationship.individualA = individualRelative.individual;
            individualRelationship.individualB = individualRelative.relative;
        } else {
            individualRelationship.individualB = individualRelative.individual;
            individualRelationship.individualA = individualRelative.relative;
        }
        return individualRelationship;
    }

    cloneForEdit() {
        const individualRelationship = new IndividualRelationship();
        individualRelationship.uuid = this.uuid;
        individualRelationship.relationship = this.relationship.clone();
        individualRelationship.enterDateTime = this.enterDateTime;
        individualRelationship.exitDateTime = this.exitDateTime;
        individualRelationship.individualA = this.individualA;
        individualRelationship.individualB = this.individualB;
        individualRelationship.voided = this.voided;
        return individualRelationship;
    }

    toJSON() {
        return {
            uuid: this.uuid,
            relationship: this.relationship,
            individualAUuid: this.individualA.uuid,
            individualBUuid: this.individualB.uuid,
            enterDateTime: this.enterDateTime,
            exitDateTime: this.exitDateTime,
            exitObservations: this.exitObservations,
            voided: this.voided,
        };
    }
}

export default IndividualRelationship;
