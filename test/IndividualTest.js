import {assert} from "chai";
import EntityFactory from "./EntityFactory";
import moment from "moment";
import Individual from "../src/Individual";
import ProgramEnrolment from "../src/ProgramEnrolment";
import _ from "lodash";
import EncounterType from "../src/EncounterType";
import Concept from "../src/Concept";
import Observation from "../src/Observation";
import SingleCodedValue from "../src/observation/SingleCodedValue";
import Encounter from "../src/Encounter";
import AddressLevelFactory from "./ref/AddressLevelFactory";

let createEnrolment = function (program) {
    const programEnrolment = new ProgramEnrolment();
    programEnrolment.program = program;
    return programEnrolment
};

describe('IndividualTest', () => {
    it('getDisplayAge', () => {
        const individual = new Individual();
        individual.dateOfBirth = '1981-01-01';
        assert.include(individual.getAge().toString(), "years");
    });

    it('staticallyEligiblePrograms', () => {
        const enrolledProgram = EntityFactory.createProgram({});
        const allPrograms = [EntityFactory.createProgram({}), EntityFactory.createProgram({}), enrolledProgram];
        const individual = new Individual();
        individual.enrolments = [createEnrolment(enrolledProgram)];
        assert.equal(individual.staticallyEligiblePrograms(allPrograms).length, 2);
    });

    it('should include programs that allows multiple enrolment even when already enrolled', function () {
        const enrolledProgram = EntityFactory.createProgram({allowMultipleEnrolments: true});
        const allPrograms = [EntityFactory.createProgram({}), EntityFactory.createProgram({}), enrolledProgram];
        const individual = new Individual();
        individual.enrolments = [createEnrolment(enrolledProgram)];
        assert.equal(individual.staticallyEligiblePrograms(allPrograms).length, 3);
    });

    it("sets years based on age of the individual", () => {
        assert.isTrue(new Individual().getAge().isInYears);

        let individual = new Individual();
        individual.dateOfBirth = moment().subtract(2, 'months');
        assert.isFalse(individual.getAge().isInYears);

        individual = new Individual();
        individual.dateOfBirth = moment().subtract(2, 'years');
        assert.isTrue(individual.getAge().isInYears);

        //this is current behaviour because the place it is used in registering individuals does not have weeks.
        individual = new Individual();
        individual.dateOfBirth = moment().subtract(2, 'weeks');
        assert.isTrue(individual.getAge().isInYears);
    });

    it('previousEnrolment', () => {
        const individual = Individual.createEmptyInstance();

        let addEnrolment = function (enrolment) {
            individual.addEnrolment(enrolment);
            return enrolment;
        };

        const program1 = EntityFactory.createProgram({name: 'FooProgram'});
        const program2 = EntityFactory.createProgram({name: 'BarProgram'});
        const programEnrolment1 = addEnrolment(EntityFactory.createEnrolment({
            program: program1,
            enrolmentDateTime: new Date(2010, 1, 1)
        }));
        const programEnrolment2 = addEnrolment(EntityFactory.createEnrolment({
            program: program2,
            enrolmentDateTime: new Date(2012, 1, 1)
        }));
        const programEnrolment3 = addEnrolment(EntityFactory.createEnrolment({
            program: program1,
            enrolmentDateTime: new Date(2014, 1, 1)
        }));
        const programEnrolment4 = addEnrolment(EntityFactory.createEnrolment({
            program: program1,
            enrolmentDateTime: new Date(2017, 1, 1)
        }));
        assert.equal(individual.getPreviousEnrolment('FooProgram', programEnrolment4.uuid).uuid, programEnrolment3.uuid);
        assert.equal(individual.getPreviousEnrolment('FooProgram', programEnrolment3.uuid).uuid, programEnrolment1.uuid);
        assert.equal(individual.getPreviousEnrolment('FooProgram', programEnrolment1.uuid), null);
        assert.equal(individual.getPreviousEnrolment('BarProgram', programEnrolment2.uuid), null);
    });

    it('firstActiveOrRecentEnrolment', () => {
        const individual = Individual.createEmptyInstance();

        let addEnrolment = function (uuid, program, enrolmentDateTime, programExitDateTime) {
            const enrolment = EntityFactory.createEnrolment({
                uuid,
                program,
                enrolmentDateTime,
                programExitDateTime
            });
            individual.addEnrolment(enrolment);
            return enrolment;
        };

        const fooProgram = EntityFactory.createProgram({name: 'FooProgram'});
        const fooEnrol1 = addEnrolment(100, fooProgram, new Date(2001, 1, 1), new Date(2001, 5, 5));
        const fooEnrol2 = addEnrolment(200, fooProgram, new Date(2002, 1, 1), new Date(2002, 5, 5));
        assert.equal(individual.firstActiveOrRecentEnrolment.uuid, 200);

        const fooEnrol3 = addEnrolment(300, fooProgram, new Date(2003, 1, 1));
        assert.equal(individual.firstActiveOrRecentEnrolment.uuid, 300);

        fooEnrol1.programExitDateTime = undefined;
        assert.equal(individual.firstActiveOrRecentEnrolment.uuid, 300);

        fooEnrol3.programExitDateTime = new Date(2003, 2, 2);
        assert.equal(individual.firstActiveOrRecentEnrolment.uuid, 100);
    });


    it('return the latest obs value from all encounters', () => {
        const individual = Individual.createEmptyInstance();
        let concept = EntityFactory.createConcept("height", Concept.dataType.Coded, "concept-1");

        const firstAnnualVisit = createEncounter(new Date(2018, 0, 11), "Annual Visit");
        individual.addEncounter(firstAnnualVisit);
        const obs1 = Observation.create(concept, new SingleCodedValue("answerUUID-1"));
        firstAnnualVisit.observations.push(obs1);

        const firstVisit = createEncounter(new Date(2018, 2, 11), "Monthly Visit");
        individual.addEncounter(firstVisit);
        const obs2 = Observation.create(concept, new SingleCodedValue("answerUUID-2"));
        firstVisit.observations.push(obs2);

        const secondVisit = createEncounter(new Date(2018, 3, 11), "Monthly Visit");
        individual.addEncounter(secondVisit);
        const obs3 = Observation.create(concept, new SingleCodedValue("answerUUID-3"));
        secondVisit.observations.push(obs3);

        const quarterlyVisit = createEncounter(new Date(2018, 3, 11), "Quarterly Visit");
        individual.addEncounter(quarterlyVisit);

        assert.equal(individual.findLatestObservationFromEncounters("height", firstVisit).valueJSON, obs2.valueJSON);
        assert.equal(individual.findLatestObservationFromEncounters("height", secondVisit).valueJSON, obs3.valueJSON);
        assert.equal(individual.findLatestObservationFromPreviousEncounters("height", firstVisit).valueJSON, obs1.valueJSON);
        assert.equal(individual.findLatestObservationFromPreviousEncounters("height", secondVisit).valueJSON, obs2.valueJSON);
        assert.equal(individual.findLastEncounterOfType(secondVisit, ['Monthly Visit']).encounterDateTime, firstVisit.encounterDateTime)
    })

    it('should get full name', function () {
        assert.equal(Individual.getFullName({firstName: 'F', middleName: 'M', lastName: 'L'}), 'F M L');
        assert.equal(Individual.getFullName({firstName: 'F', lastName: 'L'}), 'F L');
        assert.equal(Individual.getFullName({firstName: 'F'}), 'F');
    });

    it('should get full lineage', function () {
        const individual = Individual.createEmptyInstance();
        const state = AddressLevelFactory.create({name: "State1"})
        const district = AddressLevelFactory.create({parent: state, name: "District3"});
        individual.lowestAddressLevel = AddressLevelFactory.create({parent: district, name: "Block10"});
        const fullAddress = individual.fullAddress({t: x => x});
        assert.equal(fullAddress, "State1, District3, Block10");
    });
});

function createEncounter(date, name) {
    const encounter = Encounter.createEmptyInstance();
    encounter.encounterDateTime = date;
    if (!_.isEmpty(name)) encounter.encounterType = EncounterType.create(name);
    return encounter;
}
