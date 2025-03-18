import {assert} from "chai";
import EntityFactory from "./EntityFactory";
import ObservationsHolder from "../src/ObservationsHolder";
import Concept from "../src/Concept";
import TestObservationFactory from "./ref/TestObservationFactory";
import TestConceptFactory from "./ref/TestConceptFactory";
import Observation from '../src/Observation';
import PrimitiveValue from '../src/observation/PrimitiveValue';
import {createCodedConcept} from './ConceptTest';
import SingleCodedValue from '../src/observation/SingleCodedValue';
import QuestionGroup from '../src/observation/QuestionGroup';
import MultipleCodedValues from "../src/observation/MultipleCodedValues";
import FormElementStatus from "../src/application/FormElementStatus";

function getMediaAnswerElement(observationsHolder, index) {
    return getMediaAnswer(observationsHolder)[index];
}

function getMediaAnswer(observationsHolder) {
    return observationsHolder.observations[0].valueJSON.answer;
}

describe('ObservationHolderTest', () => {
    describe("Replace observation", () => {
        it('when observation being replaced is not present', function () {
            const concepts = [EntityFactory.createConcept("Concept 1", Concept.dataType.Image, "concept-1")];
            const observations = [TestObservationFactory.create({concept: concepts[0], valueJSON: new MultipleCodedValues(["a1", "a2"])})];
            const observationsHolder = new ObservationsHolder(observations);
            observationsHolder.replaceMediaObservation("a2", "a4", concepts[0].uuid);
            assert.equal(getMediaAnswerElement(observationsHolder, 0), "a1");
            assert.equal(getMediaAnswerElement(observationsHolder, 1), "a4");
            assert.equal(getMediaAnswer(observationsHolder).length, 2);
            observationsHolder.replaceMediaObservation("a2", "a4", concepts[0].uuid);
            assert.equal(getMediaAnswerElement(observationsHolder, 0), "a1");
            assert.equal(getMediaAnswerElement(observationsHolder, 1), "a4");
            assert.equal(getMediaAnswer(observationsHolder).length, 2);
        });
    });

    describe("Remove Observations not present in the form elements", () => {
        let observations, concepts, allFormElements, applicableFormElements, formElementGroup;
        beforeEach(() => {
            concepts = [EntityFactory.createConcept("Concept 1", Concept.dataType.Coded, "concept-1"),
                EntityFactory.createConcept("Concept 2", Concept.dataType.Coded, "concept-2"),
                EntityFactory.createConcept("Concept 3", Concept.dataType.Coded, "concept-3"),
                EntityFactory.createConcept("Concept 4", Concept.dataType.QuestionGroup, "concept-4"),
                EntityFactory.createConcept("Concept 4-1", Concept.dataType.Text, "concept-4-1"),
            ];
            observations = [EntityFactory.createObservation(concepts[0], "Yao"),
                EntityFactory.createObservation(concepts[1], "Ok"),
                EntityFactory.createObservation(concepts[2], "No"),
                EntityFactory.createNonPrimitiveObservation(concepts[3],
                    new QuestionGroup([EntityFactory.createObservation(concepts[4], "Yao")]))
            ];
            const formElementGroup = EntityFactory.createFormElementGroup("Form Element Group 1", 1, EntityFactory.createForm("Form 1"));
            const qgFormElement = EntityFactory.createFormElement("Form Element 4", true, concepts[3], 4, "SingleSelect", formElementGroup);
            const childFormElement = EntityFactory.createFormElement("Form Element 4-1", true, concepts[4], 5, "SingleSelect", formElementGroup);
            childFormElement.groupUuid = qgFormElement.uuid;
            allFormElements = [
                EntityFactory.createFormElement("Form Element 1", true, concepts[0], 1, "SingleSelect", formElementGroup),
                EntityFactory.createFormElement("Form Element 2", true, concepts[1], 2, "SingleSelect", formElementGroup),
                EntityFactory.createFormElement("Form Element 3", true, concepts[2], 3, "SingleSelect", formElementGroup),
                qgFormElement,
                childFormElement,
            ];
            formElementGroup.formElements = allFormElements;
            applicableFormElements = [
                ...allFormElements
            ];
        });

        it('should remove qg observations if it not applicable any more', function () {
            const observationsHolder = new ObservationsHolder(observations);
            observationsHolder.removeNonApplicableObs(allFormElements, [allFormElements[0], allFormElements[1], allFormElements[2]]);
            assert.equal(3, observationsHolder.observations.length);
        });

        it("Shouldn't remove obs if there are no form elements for that particular Form element group", () => {
            const observationsHolder = new ObservationsHolder(observations);
            assert.equal(4, observationsHolder.observations.length);
            observationsHolder.removeNonApplicableObs([], []);
            assert.equal(4, observationsHolder.observations.length);
        });

        it("Shouldn't remove obs if all obs applicable", () => {
            const observationsHolder = new ObservationsHolder(observations);
            assert.equal(4, observationsHolder.observations.length);
            observationsHolder.removeNonApplicableObs(allFormElements, applicableFormElements);
            assert.equal(4, observationsHolder.observations.length);
        });

        it("Should remove non applicable obs", () => {
            const observationsHolder = new ObservationsHolder(observations);
            assert.equal(4, observationsHolder.observations.length);
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
            assert.equal(4, observationsHolder.observations.length);
            observationsHolder.removeNonApplicableObs(allFormElements.slice(0, 2), applicableFormElements.slice(0, 1));
            assert.equal(3, observationsHolder.observations.length);
            assert.isTrue(observationsHolder.observations.some((obs) =>
                obs.concept.uuid === applicableFormElements[0].concept.uuid));
            assert.isFalse(observationsHolder.observations.some((obs) =>
                obs.concept.uuid === applicableFormElements[1].concept.uuid));
            assert.isTrue(observationsHolder.observations.some((obs) =>
                obs.concept.uuid === applicableFormElements[2].concept.uuid));
        });
    });

    describe("Test updatePrimitiveCodedObs behaviour for variation in value for FormElementStatus returned on evaluation of rule", () => {
        let observations, concepts, allFormElements, applicableFormElements, groupObsValueWrapper;
        const questionGroupConcept = TestConceptFactory.create({
            uuid: "group-concept-uuid-1",
            dataType: Concept.dataType.QuestionGroup
        });
        const questionGroupChildConcept1 = TestConceptFactory.create({
            uuid: "concept-uuid-2",
            dataType: Concept.dataType.Numeric
        });
        const questionGroupChildConcept2 = TestConceptFactory.create({
            uuid: "concept-uuid-3",
            dataType: Concept.dataType.Text
        });
        const questionGroupConceptObservations = [
            Observation.create(questionGroupChildConcept1, 5),
            Observation.create(questionGroupChildConcept2, "abc")
        ];
        beforeEach(() => {
            concepts = [EntityFactory.createConcept("Concept 1", Concept.dataType.Id, "Concept 1"),
                createCodedConcept("Concept 2"),
                EntityFactory.createConcept("Concept 3", Concept.dataType.Image, "concept-3"),
                EntityFactory.createConcept("Concept 4", Concept.dataType.Text, "concept-4"),
                EntityFactory.createConcept("Concept 5", Concept.dataType.Numeric, "concept-5"),
                EntityFactory.createConcept("Concept 6", Concept.dataType.PhoneNumber, "concept-6"),
                questionGroupConcept,
                EntityFactory.createConcept("Concept 8", Concept.dataType.Encounter, "concept-8"),];
            observations = [
                Observation.create(concepts[0], new PrimitiveValue(123, Concept.dataType.Id, Observation.AnswerSource.Auto)),
                Observation.create(concepts[1], new SingleCodedValue('5a738df9-b09a-4e7d-b683-189a9cdabcad', Observation.AnswerSource.Auto)),
                Observation.create(concepts[2], new PrimitiveValue("file:://parent/child/file1.img", Concept.dataType.Image, Observation.AnswerSource.Auto)),
                Observation.create(concepts[3], new PrimitiveValue("Yao", Concept.dataType.Text, Observation.AnswerSource.Auto)),
                Observation.create(concepts[4], new PrimitiveValue("123", Concept.dataType.Numeric, Observation.AnswerSource.Auto)),
                Observation.create(concepts[5], new PrimitiveValue("1234343567", Concept.dataType.PhoneNumber, Observation.AnswerSource.Auto)),
                Observation.create(concepts[6], new QuestionGroup(questionGroupConceptObservations)),
                Observation.create(concepts[7], new PrimitiveValue("encounter-uuid", Concept.dataType.Encounter, Observation.AnswerSource.Auto)),
            ];

            allFormElements = [
                EntityFactory.createFormElement("Form Element 1", true, concepts[0], 1, "SingleSelect"),
                EntityFactory.createFormElement("Form Element 2", true, concepts[1], 2, "SingleSelect"),
                EntityFactory.createFormElement("Form Element 3", true, concepts[2], 3, "SingleSelect"),
                EntityFactory.createFormElement("Form Element 4", true, concepts[3], 4, "SingleSelect"),
                EntityFactory.createFormElement("Form Element 5", true, concepts[4], 5, "SingleSelect"),
                EntityFactory.createFormElement("Form Element 6", true, concepts[5], 6, "SingleSelect"),
                EntityFactory.createFormElement("Form Element 7", true, concepts[6], 7, "SingleSelect"),
                EntityFactory.createFormElement("Form Element 8", true, concepts[7], 8, "SingleSelect"),
            ];
            applicableFormElements = [
                ...allFormElements
            ];

            groupObsValueWrapper = observations[6].getValueWrapper();
        });

        const visibility = true;
        let uuid = null;

        function validate(index, initialValue, updatedValue, isQuestionGroupConcept = false) {
            uuid = applicableFormElements[index].uuid;
            const observationsHolder = new ObservationsHolder(observations);

            // 1. Validate equality for initial value
            assert.equal(observationsHolder.getObservationReadableValue(concepts[index]), initialValue);

            // 2. Validate equality for updated value
            let formElementStatus = new FormElementStatus(uuid, visibility, updatedValue);
            observationsHolder.updatePrimitiveCodedObs([applicableFormElements[index]], [formElementStatus]);
            assert.equal(observationsHolder.getObservationReadableValue(concepts[index]), updatedValue);

            // 3. Validate no change when we have FormElementStatus with null value due to default rule
            formElementStatus = new FormElementStatus(uuid, visibility, null);
            observationsHolder.updatePrimitiveCodedObs([applicableFormElements[index]], [formElementStatus]);
            assert.equal(observationsHolder.getObservationReadableValue(concepts[index]), updatedValue);

            // 4. Validate null when we reset using _resetIfValueIsNull
            formElementStatus = FormElementStatus.resetIfValueIsNull(uuid, visibility);
            observationsHolder.updatePrimitiveCodedObs([applicableFormElements[index]], [formElementStatus]);
            assert.isNull(observationsHolder.getObservationReadableValue(concepts[index]));
        }

        it("Validate update of ID observation concept value based on FormElementStatus returned on executing rule", () => {
            let index = 0; //ID
            let initialValue = 123;
            let updatedValue = 124;
            validate(index, initialValue, updatedValue);
        });

        it("Validate update of Coded observation concept value based on FormElementStatus returned on executing rule", () => {
            let index = 1; //Coded
            let initialValue = 'Pregnancy Induced Hypertension';
            let updatedValue = 'Other';
            validate(index, initialValue, updatedValue);
        });

        it("Validate update of Image observation concept value based on FormElementStatus returned on executing rule", () => {
            let index = 2; //Image
            let initialValue = "file:://parent/child/file1.img";
            let updatedValue = "file:://parent/child/file2.img";
            validate(index, initialValue, updatedValue);
        });

        it("Validate update of Text observation concept value based on FormElementStatus returned on executing rule", () => {
            let index = 3; //Text
            let initialValue = 'Yao';
            let updatedValue = 'YaoUpdated';
            validate(index, initialValue, updatedValue);
        });

        it("Validate update of Numeric observation concept value based on FormElementStatus returned on executing rule", () => {
            let index = 4; //Numeric
            let initialValue = '123';
            let updatedValue = '1234';
            validate(index, initialValue, updatedValue);
        });

        it("Validate update of PhoneNumber observation concept value based on FormElementStatus returned on executing rule", () => {
            let index = 5; //PhoneNumber
            let initialValue = '1234343567';
            let updatedValue = '1234343566';
            validate(index, initialValue, updatedValue);
        });
    });
    //TODO "Remove Observations if FormElementStatus Value is set to null on purpose"


    it('has any answer', function () {
        const q1 = TestConceptFactory.create({uuid: "q1"});
        const q2 = TestConceptFactory.create({uuid: "q2"});
        const a = TestObservationFactory.create({concept: q1, valueJSON: "a1, a2"});
        const b = TestObservationFactory.create({concept: q2, valueJSON: "a2"});
        const obsHolder = {
            observations: [a, b]
        };
        assert.equal(true, ObservationsHolder.hasAnyAnswer(obsHolder, "q1", ["a1", "a2"]));
        assert.equal(true, ObservationsHolder.hasAnyAnswer(obsHolder, "q1", ["a1"]));
        assert.equal(false, ObservationsHolder.hasAnyAnswer(obsHolder, "q2", ["a1"]));
    });
});
