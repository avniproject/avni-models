import { assert } from "chai";
import EntityFactory from "./EntityFactory";
import ObservationsHolder from "../src/ObservationsHolder";
import Concept from "../src/Concept";

describe('ObservationHolderTest', () => {
    describe("Remove Observations not present in the form elements", () => {
        let observations, concepts, allFormElements, applicableFormElements;
        beforeEach(() => {
            concepts = [EntityFactory.createConcept("Concept 1", Concept.dataType.Coded, "concept-1"),
            EntityFactory.createConcept("Concept 2", Concept.dataType.Coded, "concept-2"),
            EntityFactory.createConcept("Concept 3", Concept.dataType.Coded, "concept-3")];
            observations = [EntityFactory.createObservation(concepts[0], "Yao"),
            EntityFactory.createObservation(concepts[1], "Ok"),
            EntityFactory.createObservation(concepts[2], "No")];
            allFormElements = [
                EntityFactory.createFormElement("Form Element 1", true, concepts[0], 1, "SingleSelect"),
                EntityFactory.createFormElement("Form Element 2", true, concepts[1], 2, "SingleSelect"),
                EntityFactory.createFormElement("Form Element 3", true, concepts[2], 3, "SingleSelect"),
            ];
            applicableFormElements = [
                ...allFormElements
            ];
        });

        it("Shouldn't remove obs if there are no form elements for that particular Form element group", () => {
            const observationsHolder = new ObservationsHolder(observations);
            assert.equal(3, observationsHolder.observations.length);
            observationsHolder.removeNonApplicableObs([], []);
            assert.equal(3, observationsHolder.observations.length);
        });

        it("Shouldn't remove obs if all obs applicable", () => {
            const observationsHolder = new ObservationsHolder(observations);
            assert.equal(3, observationsHolder.observations.length);
            observationsHolder.removeNonApplicableObs(allFormElements, applicableFormElements);
            assert.equal(3, observationsHolder.observations.length);
        });

        it("Should remove non applicable obs", () => {
            const observationsHolder = new ObservationsHolder(observations);
            assert.equal(3, observationsHolder.observations.length);
            observationsHolder.removeNonApplicableObs(allFormElements, applicableFormElements.slice(0, 2));
            assert.equal(2, observationsHolder.observations.length);
            assert.isTrue(observationsHolder.observations.some((obs) =>
                obs.concept.uuid === applicableFormElements[0].concept.uuid));
            assert.isTrue(observationsHolder.observations.some((obs) =>
                obs.concept.uuid === applicableFormElements[1].concept.uuid));
            assert.isFalse(observationsHolder.observations.some((obs) =>
                obs.concept.uuid === applicableFormElements[2].concept.uuid));
        });

        it("Should remove non applicable obs only based on the diff of that form element", () => {
            const observationsHolder = new ObservationsHolder(observations);
            assert.equal(3, observationsHolder.observations.length);
            observationsHolder.removeNonApplicableObs(allFormElements.slice(0, 2), applicableFormElements.slice(0, 1));
            assert.equal(2, observationsHolder.observations.length);
            assert.isTrue(observationsHolder.observations.some((obs) =>
                obs.concept.uuid === applicableFormElements[0].concept.uuid));
            assert.isFalse(observationsHolder.observations.some((obs) =>
                obs.concept.uuid === applicableFormElements[1].concept.uuid));
            assert.isTrue(observationsHolder.observations.some((obs) =>
                obs.concept.uuid === applicableFormElements[2].concept.uuid));
        });
    });

    describe('updateObs', function () {
        let observations, concepts, allFormElements, applicableFormElements;

        beforeEach(() => {
            concepts = [EntityFactory.createConcept("Concept 1", Concept.dataType.Numeric, "concept-1"),
            EntityFactory.createConcept("Concept 2", Concept.dataType.Text, "concept-2"),
            EntityFactory.createConcept("Concept 3", Concept.dataType.Date, "concept-3"),
            EntityFactory.createConcept("Concept 3", Concept.dataType.Coded, "concept-4"),
            EntityFactory.createConcept("Concept 3", Concept.dataType.Coded, "concept-5")
            ];

            EntityFactory.addCodedAnswers(concepts[3], ["Answer 1", "Answer 2"]);
            EntityFactory.addCodedAnswers(concepts[4], ["Answer 3", "Answer 4", "Answer 5"]);

            observations = [EntityFactory.createObservation(concepts[0], 100),
            EntityFactory.createObservation(concepts[1], "empty")];
            allFormElements = [
                EntityFactory.createFormElement("Form Element 1", true, concepts[0], 1, "Numeric"),
                EntityFactory.createFormElement("Form Element 2", true, concepts[1], 2, "Text"),
                EntityFactory.createFormElement("Form Element 3", true, concepts[2], 3, "Date"),
                EntityFactory.createFormElement("Form Element 4", true, concepts[3], 4, "SingleSelect"),
                EntityFactory.createFormElement("Form Element 5", true, concepts[4], 5, "MultiSelect"),
            ];
            applicableFormElements = [
                ...allFormElements
            ];
        });

        it('updates primitive obs', () => {
            const observationsHolder = new ObservationsHolder(observations);
            const date = '01-Jan-2019';
            observationsHolder.updateObs(allFormElements[0], 200);
            observationsHolder.updateObs(allFormElements[1], "Not empty");
            observationsHolder.updateObs(allFormElements[2], date);


            assert.equal(200, observationsHolder.observations.find(obs => obs.concept.uuid === concepts[0].uuid).getValue());
            assert.equal("Not empty", observationsHolder.observations.find(obs => obs.concept.uuid === concepts[1].uuid).getValue());
            assert.equal(3, observationsHolder.observations.length);
            assert.equal(date, observationsHolder.observations.find(obs => obs.concept.uuid === concepts[2].uuid).getValueWrapper().asDisplayDate());
        });

        it('updates coded obs', () => {
            const observationsHolder = new ObservationsHolder(observations);
            let answer = [
                concepts[4].getPossibleAnswerConcept("Answer 3").concept.uuid,
                concepts[4].getPossibleAnswerConcept("Answer 4").concept.uuid
            ];
            observationsHolder.updateObs(allFormElements[4], answer);
            assert.equal(answer, observationsHolder.observations.find(obs => obs.concept.uuid === concepts[4].uuid).getValue());

            //Removal of an answer
            answer = [
                concepts[4].getPossibleAnswerConcept("Answer 3").concept.uuid,
            ];
            observationsHolder.updateObs(allFormElements[4], answer);
            assert.equal(answer, observationsHolder.observations.find(obs => obs.concept.uuid === concepts[4].uuid).getValue());

            //No answer provided
            answer = [];
            observationsHolder.updateObs(allFormElements[4], answer);
            assert.equal(undefined, observationsHolder.observations.find(obs => obs.concept.uuid === concepts[4].uuid));

        });
    });
});
