import {assert} from "chai";
import EncounterTypeFactory from "../ref/EncounterTypeFactory";
import ProgramFactory from "../ref/ProgramFactory";
import FormMappingFactory from "../ref/FormMappingFactory";
import MetaDataService from "../../src/service/MetaDataService";
import SubjectTypeFactory from "../ref/SubjectTypeFactory";
import Form from "../../src/application/Form";

describe("MetaDataService", () => {
    it('should get encounter types for programs', () => {
        const encounterTypes = [EncounterTypeFactory.create({uuid: "ET1"}), EncounterTypeFactory.create({uuid: "ET2"}), EncounterTypeFactory.create({uuid: "ET3"})];
        const programs = [ProgramFactory.create({uuid: "P1"}), ProgramFactory.create({uuid: "P2"})];
        const formMappings = [FormMappingFactory.createProgramEncounterTypeMapping({
            encounterTypeUUID: "ET1",
            programUUID: "P1"
        }),
            FormMappingFactory.createProgramEncounterTypeMapping({
                encounterTypeUUID: "ET2",
                programUUID: "P2"
            }),
            FormMappingFactory.createProgramEncounterTypeMapping({
                encounterTypeUUID: "ET3",
                programUUID: "P2"
            }),
            FormMappingFactory.createProgramEncounterTypeMapping({
                encounterTypeUUID: "ET3",
                programUUID: "P2",
                formType: Form.formTypes.ProgramEncounterCancellation
            })
        ];
        const encounterTypesForPrograms = MetaDataService.getEncounterTypesForPrograms(encounterTypes, programs, formMappings);
        assert.equal(encounterTypesForPrograms.length, 3);
    });

    it('should get programs for subject types', () => {
        const programs = [ProgramFactory.create({uuid: "P1"}), ProgramFactory.create({uuid: "P2"}), ProgramFactory.create({uuid: "P3"})];
        const formMappings = [FormMappingFactory.createProgramEnrolmentTypeMapping({
            subjectTypeUUID: "ST1",
            programUUID: "P1"
        }),
            FormMappingFactory.createProgramEnrolmentTypeMapping({
                subjectTypeUUID: "ST1",
                programUUID: "P2"
            }),
            FormMappingFactory.createProgramEnrolmentTypeMapping({
                subjectTypeUUID: "ST2",
                programUUID: "P3"
            }),
            FormMappingFactory.createProgramEncounterTypeMapping({
                subjectTypeUUID: "ST1",
                encounterTypeUUID: "ET2",
                programUUID: "P2"
            })
        ];
        const subjectType1 = SubjectTypeFactory.create({uuid: "ST1"});
        const subjectType2 = SubjectTypeFactory.create({uuid: "ST2"});
        const programsForSubjectType1 = MetaDataService.getProgramsForSubjectType(programs, subjectType1, formMappings);
        const programsForSubjectType2 = MetaDataService.getProgramsForSubjectType(programs, subjectType2, formMappings);
        assert.equal(programsForSubjectType1.length, 2);
        assert.equal(programsForSubjectType2.length, 1);
    });

    it('should every on obs fields', function () {
        assert.equal(false, MetaDataService.everyObservationField(() => false));
        assert.equal(true, MetaDataService.everyObservationField(() => true));
    });
});
