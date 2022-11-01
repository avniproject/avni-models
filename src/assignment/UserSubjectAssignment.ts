import BaseEntity from "../BaseEntity";
import ResourceUtil from "../utility/ResourceUtil";

class UserSubjectAssignment extends BaseEntity {

    static schema = {
        name: 'UserSubjectAssignment',
        primaryKey: 'uuid',
        properties: {
            uuid: 'string',
            subjectUUID: 'string',
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
        return userSubjectAssignment;
    }

}


export default UserSubjectAssignment;
