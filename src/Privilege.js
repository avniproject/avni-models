class Privilege {
    static schema = {
        name: "Privilege",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            name: "string",
            description: "string",
            entityType: "string"
        }
    };
    static privilegeName = {
        viewSubject: 'View subject',
        registerSubject: 'Register subject',
        editSubject: 'Edit subject',
        voidSubject: 'Void subject',
        enrolSubject: 'Enrol subject',
        viewEnrolmentDetails: 'View enrolment details',
        editEnrolmentDetails: 'Edit enrolment details',
        exitEnrolment: 'Exit enrolment',
        viewVisit: 'View visit',
        scheduleVisit: 'Schedule visit',
        performVisit: 'Perform visit',
        editVisit: 'Edit visit',
        cancelVisit: 'Cancel visit',
        viewChecklist: 'View checklist',
        editChecklist: 'Edit checklist',
        addMember: 'Add member',
        editMember: 'Edit member',
        removeMember: 'Remove member'
    };

    static privilegeEntityType = {
        subject: 'Subject',
        enrolment: 'Enrolment',
        encounter: 'Encounter',
        checklist: 'Checklist'
    };

    static fromResource(resource) {
        let privilege = new Privilege();
        privilege.uuid = resource.uuid;
        privilege.name = resource.name;
        privilege.description = resource.description;
        privilege.entityType = resource.entityType;
        return privilege;
    }
}

export default Privilege;
