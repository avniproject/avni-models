import _ from "lodash";

const assertTrue = (value, message) => {
    if (!value) {
        throw new Error(message);
    }
};

export default class WorkItem {
    static type = {
        REGISTRATION: 'REGISTRATION',
        ENCOUNTER: 'ENCOUNTER',
        PROGRAM_ENROLMENT: 'PROGRAM_ENROLMENT',
        PROGRAM_EXIT: 'PROGRAM_EXIT',
        PROGRAM_ENCOUNTER: 'PROGRAM_ENCOUNTER',
        CANCELLED_ENCOUNTER: 'CANCELLED_ENCOUNTER',
        ADD_MEMBER: 'ADD_MEMBER',
        HOUSEHOLD: 'HOUSEHOLD',
    };

    constructor(id, type, parameters) {
        assertTrue(id, 'Id is mandatory');
        this.id = id;
        this.type = type;
        this.parameters = parameters || {};
    }

    validate() {
        assertTrue(WorkItem.type[this.type], 'Work item must be one of WorkItem.type');
        if (!_.includes([WorkItem.type.REGISTRATION, WorkItem.type.ADD_MEMBER, WorkItem.type.HOUSEHOLD], this.type)) {
            this.ensureFieldExists('subjectUUID');
        }
        if (this.type === WorkItem.type.PROGRAM_ENROLMENT) {
            this.ensureFieldExists('programName');
        }
        if (this.type === WorkItem.type.PROGRAM_ENCOUNTER) {
            this.ensureFieldExists('encounterType');
        }
        if (this.type === WorkItem.type.ENCOUNTER) {
            this.ensureFieldExists('encounterType');
        }
    }

    fieldMissingError(field) {
        return `Work Item id: ${this.id}, type: ${this.type}, ` +
            `parameters: {${Object.keys(this.parameters)}}, ` +
            `'${field}: ${this.parameters[field]}', ` +
            `errorMessage: '${field} is mandatory'`;
    }

    ensureFieldExists(field) {
        assertTrue(_.get(this.parameters, field), this.fieldMissingError(field));
    }

    addParams(params) {
        _.assign(this.parameters, params);
    }
}
