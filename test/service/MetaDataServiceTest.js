import {assert} from "chai";
import EncounterTypeFactory from "../ref/EncounterTypeFactory";
import ProgramFactory from "../ref/ProgramFactory";
import FormMappingFactory from "../ref/FormMappingFactory";
import MetaDataService from "../../src/service/MetaDataService";
import SubjectTypeFactory from "../ref/SubjectTypeFactory";

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
            })
        ];
        const encounterTypesForPrograms = MetaDataService.getEncounterTypesForPrograms(encounterTypes, programs, formMappings);
        assert.equal(encounterTypesForPrograms.length, 2);
    });

    it('should get programs for subject types', () => {
        const programs = [ProgramFactory.create({uuid: "P1"}), ProgramFactory.create({uuid: "P2"})];
        const formMappings = [FormMappingFactory.createProgramEnrolmentTypeMapping({
            subjectTypeUUID: "ST1",
            programUUID: "P1"
        }),
            FormMappingFactory.createProgramEncounterTypeMapping({
                subjectTypeUUID: "ST1",
                encounterTypeUUID: "ET2",
                programUUID: "P2"
            })
        ];
        const subjectType = SubjectTypeFactory.create({uuid: "ST1"});
        const programsForSubjectType = MetaDataService.getProgramsForSubjectType(programs, subjectType, formMappings);
        assert.equal(programsForSubjectType.length, 1);
    });

    it('should every on obs fields', function () {
        assert.equal(false, MetaDataService.everyObservationField(() => false));
        assert.equal(true, MetaDataService.everyObservationField(() => true));
    });
});
