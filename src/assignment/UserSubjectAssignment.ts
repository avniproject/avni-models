import BaseEntity from "../BaseEntity";
import ResourceUtil from "../utility/ResourceUtil";
import SchemaNames from "../SchemaNames";
import {AuditFields, mapAuditFields} from "../utility/AuditUtil";

class UserSubjectAssignment extends BaseEntity {

    static schema = {
        name: SchemaNames.UserSubjectAssignment,
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

    static fromResource(resource) {
        const userSubjectAssignment = new UserSubjectAssignment();
        userSubjectAssignment.uuid = resource.uuid;
        userSubjectAssignment.subjectUUID = ResourceUtil.getUUIDFor(resource, 'subjectUUID');
        mapAuditFields(userSubjectAssignment, resource);
        return userSubjectAssignment;
    }

}


export default UserSubjectAssignment;
