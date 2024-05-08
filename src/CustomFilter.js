class CustomFilter {
    static type = {
        Name: "Name",
        Age: "Age",
        SearchAll: "SearchAll",
        Gender: "Gender",
        RegistrationDate: "RegistrationDate",
        EnrolmentDate: "EnrolmentDate",
        ProgramEncounterDate: "ProgramEncounterDate",
        EncounterDate: "EncounterDate",
        Address: "Address",
        Concept: "Concept",
        GroupSubject: "GroupSubject",
        SubjectType: "SubjectType"
    };

    static getDashboardFilterTypes() {
        const clonedTypes = {...CustomFilter.type};
        delete clonedTypes.Name;
        delete clonedTypes.Age;
        delete clonedTypes.SearchAll;
        return clonedTypes;
    }

    static getDashboardFilterWidgets() {
        const cloned = {...CustomFilter.widget};
        delete cloned.Relative;
        return cloned
    }

    static scope = {
        ProgramEncounter: "programEncounter",
        ProgramEnrolment: "programEnrolment",
        Registration: "registration",
        Encounter: "encounter",
    };

    static widget = {
        Default: "Default",
        Range: "Range",
        Relative: "Relative",
    };
}

export default CustomFilter;
