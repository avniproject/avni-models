class CustomFilter {

    static type = {
        Name: 'Name',
        Age: 'Age',
        OtherData: 'OtherData',
        Gender: 'Gender',
        RegistrationDate: 'RegistrationDate',
        EnrolmentDate: 'EnrolmentDate',
        ProgramEncounterDate: 'ProgramEncounterDate',
        EncounterDate: 'EncounterDate',
        Address: 'Address',
        Concept: 'Concept'
    };

    static scope = {
        ProgramEncounter: 'programEncounter',
        ProgramEnrolment: 'programEnrolment',
        Registration: 'registration',
        Encounter: 'encounter'
    };

    static widget = {
        Default: 'Default',
        Range: 'Range',
        SpecialWidget: 'SpecialWidget'
    };
}

export default CustomFilter;
