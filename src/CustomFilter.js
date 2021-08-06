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
  };

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
