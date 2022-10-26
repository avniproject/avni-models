import {assert} from "chai";
import ProgramEncounter from "../src/ProgramEncounter";
import ProgramEnrolment from "../src/ProgramEnrolment";
import ValidationResultsInspector from "./ValidationResultsInspector";
import {Individual, SubjectType} from "../src";

describe('ProgramEncounterTest', () => {
    it('validate', () => {
        const programEncounter = ProgramEncounter.createEmptyInstance();
        programEncounter.programEnrolment = ProgramEnrolment.createEmptyInstance();
        programEncounter.encounterDateTime = null;

        let validationResults = programEncounter.validate();
        assert.equal(ValidationResultsInspector.numberOfErrors(validationResults),1);

        programEncounter.programEnrolment.enrolmentDateTime = new Date(2017, 0, 0, 5);
        programEncounter.encounterDateTime = new Date(2016, 0, 0);
        validationResults = programEncounter.validate();
        assert.equal(ValidationResultsInspector.numberOfErrors(validationResults),1);

        programEncounter.encounterDateTime = new Date(2017, 1, 0);
        validationResults = programEncounter.validate();
        assert.equal(ValidationResultsInspector.numberOfErrors(validationResults),0);

        //ignore time differences
        programEncounter.encounterDateTime = new Date(2017, 0, 0, 3);
        validationResults = programEncounter.validate();
        assert.equal(ValidationResultsInspector.numberOfErrors(validationResults),0);
    });

  it('should get subject type', function () {
    const programEncounter = ProgramEncounter.createEmptyInstance();
    const individual = new Individual();
    const subjectType = new SubjectType();
    subjectType.uuid = "uuid1";
    const programEnrolment = new ProgramEnrolment();

    individual.subjectType = subjectType;
    programEnrolment.individual = individual;
    programEncounter.programEnrolment = programEnrolment;
    assert.equal("uuid1", programEncounter.subjectType.uuid);
  });

  it('should build from resource', function () {
    const resource = {...ProgramEncounter.createEmptyInstance().that};
    const programEnrolment = ProgramEnrolment.createEmptyInstance();
    const entityService = {
      findByKey: jest.fn().mockReturnValue(programEnrolment)
    };
    const programEncounter = ProgramEncounter.fromResource(resource, entityService);
    assert.equal("ProgramEncounter", programEncounter.constructor.name);
  });

  it('should clone right type', function () {
    const cloned = ProgramEncounter.createEmptyInstance().cloneForEdit();
    assert.equal("ProgramEncounter", cloned.constructor.name);
  });
});
