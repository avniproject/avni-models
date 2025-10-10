import BaseEntity from "../BaseEntity";
import ResourceUtil from "../utility/ResourceUtil";
import SchemaNames from "../SchemaNames";
import {AuditFields, mapAuditFields} from "../utility/AuditUtil";

class UserSubjectAssignment extends BaseEntity {

    static schema = {
        name: "UserSubjectAssignment",
        primaryKey: 'uuid',
        properties: {
            uuid: 'string',
            subjectUUID: 'string',
            ...AuditFields
        }
    };

    constructor(that = null) {
        super(that);
    }

    get subjectUUID() {
        return this.that.subjectUUID;
    }

    set subjectUUID(x) {
        this.that.subjectUUID = x;
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

    static fromResource(resource) {
        const userSubjectAssignment = new UserSubjectAssignment();
        userSubjectAssignment.uuid = resource.uuid;
        userSubjectAssignment.subjectUUID = ResourceUtil.getUUIDFor(resource, 'subjectUUID');
        mapAuditFields(userSubjectAssignment, resource);
        return userSubjectAssignment;
    }

}


export default UserSubjectAssignment;
