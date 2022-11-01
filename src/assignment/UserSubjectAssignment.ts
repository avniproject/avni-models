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

    uuid: string;
    subjectUUID: string;

    static fromResource(resource) {
        const userSubjectAssignment = new UserSubjectAssignment();
        userSubjectAssignment.uuid = resource.uuid;
        userSubjectAssignment.subjectUUID = ResourceUtil.getUUIDFor(resource, 'subjectUUID');
        return userSubjectAssignment;
    }

}


export default UserSubjectAssignment;
