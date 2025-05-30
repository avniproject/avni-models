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
import RepeatableQuestionGroup from "../src/observation/RepeatableQuestionGroup";

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
        
        it('should replace media in a QuestionGroup', function () {
            // Create concepts for QuestionGroup and media observation
            const qgConcept = EntityFactory.createConcept("Question Group", Concept.dataType.QuestionGroup, "qg-concept");
            const mediaConcept = EntityFactory.createConcept("Image", Concept.dataType.Image, "media-concept");
            
            // Create a media observation to be inside the question group
            const mediaObservation = TestObservationFactory.create({
                concept: mediaConcept, 
                valueJSON: new MultipleCodedValues(["img1.jpg", "img2.jpg"])
            });
            
            // Create a question group containing the media observation
            const questionGroup = new QuestionGroup([mediaObservation]);
            
            // Create the observation with the question group
            const qgObservation = new Observation();
            qgObservation.concept = qgConcept;
            qgObservation.valueJSON = questionGroup;
            
            // Add the question group observation to the holder
            const observationsHolder = new ObservationsHolder([qgObservation]);
            
            // Replace a media value in the question group
            observationsHolder.replaceMediaObservation("img2.jpg", "img2_updated.jpg", mediaConcept.uuid);
            
            // Verify the replacement worked
            const updatedQG = observationsHolder.observations[0].valueJSON;
            const updatedMediaObs = updatedQG.groupObservations[0];
            const mediaValues = updatedMediaObs.valueJSON.answer;
            
            assert.equal(mediaValues[0], "img1.jpg");
            assert.equal(mediaValues[1], "img2_updated.jpg");
            assert.equal(mediaValues.length, 2);
        });
        
        it('should replace media in a RepeatableQuestionGroup', function () {
            // Create concepts for RepeatableQuestionGroup and media observation
            const rqgConcept = EntityFactory.createConcept("Repeatable Question Group", Concept.dataType.QuestionGroup, "rqg-concept");
            const mediaConcept = EntityFactory.createConcept("Image", Concept.dataType.Image, "media-concept");
            
            // Create media observations for each group in the repeatable group
            const mediaObs1 = TestObservationFactory.create({
                concept: mediaConcept, 
                valueJSON: new MultipleCodedValues(["group1_img.jpg"])
            });
            
            const mediaObs2 = TestObservationFactory.create({
                concept: mediaConcept, 
                valueJSON: new MultipleCodedValues(["group2_img.jpg"])
            });
            
            // Create two question groups with different media observations
            const group1 = new QuestionGroup([mediaObs1]);
            const group2 = new QuestionGroup([mediaObs2]);
            
            // Create the repeatable question group containing both groups
            const repeatableGroup = new RepeatableQuestionGroup([group1, group2]);
            
            // Create the observation with the repeatable question group
            const rqgObservation = new Observation();
            rqgObservation.concept = rqgConcept;
            rqgObservation.valueJSON = repeatableGroup;
            
            // Add the repeatable question group observation to the holder
            const observationsHolder = new ObservationsHolder([rqgObservation]);
            
            // Replace a media value in the second group
            observationsHolder.replaceMediaObservation("group2_img.jpg", "group2_updated.jpg", mediaConcept.uuid);
            
            // Verify the replacement worked
            const updatedRQG = observationsHolder.observations[0].valueJSON;
            const groups = updatedRQG.repeatableObservations;
            
            // First group should be unchanged
            const group1MediaObs = groups[0].groupObservations[0];
            assert.equal(group1MediaObs.valueJSON.answer[0], "group1_img.jpg");
            
            // Second group should have updated media
            const group2MediaObs = groups[1].groupObservations[0];
            assert.equal(group2MediaObs.valueJSON.answer[0], "group2_updated.jpg");
        });
        
        it('should replace media in nested structure by value when concept UUID is not provided', function () {
            // Create concepts for RepeatableQuestionGroup and media observation
            const rqgConcept = EntityFactory.createConcept("Repeatable Question Group", Concept.dataType.QuestionGroup, "rqg-concept");
            const mediaConcept = EntityFactory.createConcept("Image", Concept.dataType.Image, "media-concept");
            
            // Create a media observation
            const mediaObs = TestObservationFactory.create({
                concept: mediaConcept, 
                valueJSON: new MultipleCodedValues(["find_by_value.jpg"])
            });
            
            // Create a question group with the media observation
            const group = new QuestionGroup([mediaObs]);
            
            // Create the repeatable question group containing the group
            const repeatableGroup = new RepeatableQuestionGroup([group]);
            
            // Create the observation with the repeatable question group
            const rqgObservation = new Observation();
            rqgObservation.concept = rqgConcept;
            rqgObservation.valueJSON = repeatableGroup;
            
            // Add the repeatable question group observation to the holder
            const observationsHolder = new ObservationsHolder([rqgObservation]);
            
            // Replace media by value without providing concept UUID
            observationsHolder.replaceMediaObservation("find_by_value.jpg", "found_and_updated.jpg");
            
            // Verify the replacement worked even without concept UUID
            const updatedRQG = observationsHolder.observations[0].valueJSON;
            const updatedGroup = updatedRQG.repeatableObservations[0];
            const updatedMediaObs = updatedGroup.groupObservations[0];
            
            assert.equal(updatedMediaObs.valueJSON.answer[0], "found_and_updated.jpg");
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
