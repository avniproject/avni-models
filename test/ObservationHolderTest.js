import {assert} from "chai";
import _ from "lodash";
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
import Encounter from "../src/Encounter";
import ProgramEnrolment from "../src/ProgramEnrolment";
import {findMediaObservations} from "../src/Media";

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

        it('should replace the value in every observation referencing it - across concepts and select types', function () {
            // RQG single-select source + top-level multi-select rule-copied display (tanuh Suspicious Images Display)
            const rqgConcept = EntityFactory.createConcept("Take Photos", Concept.dataType.QuestionGroup, "rqg-concept");
            const oralImageConcept = EntityFactory.createConcept("Oral Image", Concept.dataType.Image, "oral-image-concept");
            const displayConcept = EntityFactory.createConcept("Suspicious Images Display", Concept.dataType.Image, "display-concept");

            const oralImageObs = TestObservationFactory.create({
                concept: oralImageConcept,
                valueJSON: new PrimitiveValue("57137301.jpg", Concept.dataType.Image)
            });
            const rqgObservation = new Observation();
            rqgObservation.concept = rqgConcept;
            rqgObservation.valueJSON = new RepeatableQuestionGroup([new QuestionGroup([oralImageObs])]);

            const displayObs = TestObservationFactory.create({
                concept: displayConcept,
                valueJSON: new MultipleCodedValues(["https://s3/cfaafbaf.jpg", "57137301.jpg"])
            });

            const observationsHolder = new ObservationsHolder([rqgObservation, displayObs]);
            // concept hint points at the RQG child — the other reference must still be replaced
            const replaced = observationsHolder.replaceMediaObservation("57137301.jpg", "https://s3/57137301.jpg", oralImageConcept.uuid);

            assert.isTrue(replaced);
            const rqgChild = observationsHolder.observations[0].valueJSON.repeatableObservations[0].groupObservations[0];
            assert.equal(rqgChild.valueJSON.answer, "https://s3/57137301.jpg");
            assert.deepEqual(observationsHolder.observations[1].valueJSON.answer,
                ["https://s3/cfaafbaf.jpg", "https://s3/57137301.jpg"]);
        });

        it('should replace both when the source is top-level and the duplicate is inside an RQG row', function () {
            const sourceConcept = EntityFactory.createConcept("Photo", Concept.dataType.Image, "source-concept");
            const rqgConcept = EntityFactory.createConcept("Display Group", Concept.dataType.QuestionGroup, "rqg-concept");
            const displayConcept = EntityFactory.createConcept("Display Images", Concept.dataType.Image, "display-concept");

            const sourceObs = TestObservationFactory.create({
                concept: sourceConcept,
                valueJSON: new PrimitiveValue("photo.jpg", Concept.dataType.Image)
            });
            const displayObs = TestObservationFactory.create({
                concept: displayConcept,
                valueJSON: new MultipleCodedValues(["photo.jpg"])
            });
            const rqgObservation = new Observation();
            rqgObservation.concept = rqgConcept;
            rqgObservation.valueJSON = new RepeatableQuestionGroup([new QuestionGroup([displayObs])]);

            const observationsHolder = new ObservationsHolder([sourceObs, rqgObservation]);
            const replaced = observationsHolder.replaceMediaObservation("photo.jpg", "https://s3/photo.jpg", sourceConcept.uuid);

            assert.isTrue(replaced);
            assert.equal(observationsHolder.observations[0].valueJSON.answer, "https://s3/photo.jpg");
            const rqgChild = observationsHolder.observations[1].valueJSON.repeatableObservations[0].groupObservations[0];
            assert.deepEqual(rqgChild.valueJSON.answer, ["https://s3/photo.jpg"]);
        });

        it('should replace in every RQG row referencing the value', function () {
            const rqgConcept = EntityFactory.createConcept("Group", Concept.dataType.QuestionGroup, "rqg-concept");
            const mediaConcept = EntityFactory.createConcept("Image", Concept.dataType.Image, "media-concept");

            const row1Obs = TestObservationFactory.create({concept: mediaConcept, valueJSON: new MultipleCodedValues(["dup.jpg"])});
            const row2Obs = TestObservationFactory.create({concept: mediaConcept, valueJSON: new MultipleCodedValues(["dup.jpg", "other.jpg"])});
            const rqgObservation = new Observation();
            rqgObservation.concept = rqgConcept;
            rqgObservation.valueJSON = new RepeatableQuestionGroup([new QuestionGroup([row1Obs]), new QuestionGroup([row2Obs])]);

            const observationsHolder = new ObservationsHolder([rqgObservation]);
            const replaced = observationsHolder.replaceMediaObservation("dup.jpg", "https://s3/dup.jpg", mediaConcept.uuid);

            assert.isTrue(replaced);
            const rows = observationsHolder.observations[0].valueJSON.repeatableObservations;
            assert.deepEqual(rows[0].groupObservations[0].valueJSON.answer, ["https://s3/dup.jpg"]);
            assert.deepEqual(rows[1].groupObservations[0].valueJSON.answer, ["https://s3/dup.jpg", "other.jpg"]);
        });

        it('should return false when no observation references the value', function () {
            const concept = EntityFactory.createConcept("Image", Concept.dataType.Image, "media-concept");
            const obs = TestObservationFactory.create({concept, valueJSON: new MultipleCodedValues(["a.jpg"])});
            const observationsHolder = new ObservationsHolder([obs]);

            assert.isFalse(observationsHolder.replaceMediaObservation("missing.jpg", "https://s3/missing.jpg", concept.uuid));
            assert.deepEqual(observationsHolder.observations[0].valueJSON.answer, ["a.jpg"]);
        });

        it('replaces by value even when the conceptUUID hint matches nothing', function () {
            const concept = EntityFactory.createConcept("Image", Concept.dataType.Image, "media-concept");
            const obs = TestObservationFactory.create({concept, valueJSON: new MultipleCodedValues(["x.jpg"])});
            const observationsHolder = new ObservationsHolder([obs]);

            assert.isTrue(observationsHolder.replaceMediaObservation("x.jpg", "u.jpg", "some-uuid-matching-nothing"));
            assert.deepEqual(observationsHolder.observations[0].valueJSON.answer, ["u.jpg"]);
        });

        it('collapses duplicate occurrences in a multi-select into the single replaced entry', function () {
            const concept = EntityFactory.createConcept("Image", Concept.dataType.Image, "media-concept");
            const obs = TestObservationFactory.create({concept, valueJSON: new MultipleCodedValues(["d.jpg", "d.jpg", "other.jpg"])});
            const observationsHolder = new ObservationsHolder([obs]);

            assert.isTrue(observationsHolder.replaceMediaObservation("d.jpg", "u.jpg", concept.uuid));
            // Duplicates are not meaningful for media values; the replace dedups them.
            assert.deepEqual(observationsHolder.observations[0].valueJSON.answer, ["u.jpg", "other.jpg"]);
        });

        it('preserves answerSource of the wrapper on replace (multi-select and single-select)', function () {
            const nonDefaultSource = Observation.AnswerSource.Auto;
            assert.notEqual(nonDefaultSource, Observation.AnswerSource.Manual);

            // multi-select
            const multiConcept = EntityFactory.createConcept("Multi Image", Concept.dataType.Image, "multi-concept");
            const multiObs = TestObservationFactory.create({concept: multiConcept, valueJSON: new MultipleCodedValues(["a.jpg"], nonDefaultSource)});
            const multiHolder = new ObservationsHolder([multiObs]);
            assert.isTrue(multiHolder.replaceMediaObservation("a.jpg", "u.jpg", multiConcept.uuid));
            assert.equal(multiHolder.observations[0].valueJSON.answerSource, nonDefaultSource);

            // single-select
            const singleConcept = EntityFactory.createConcept("Single Image", Concept.dataType.Image, "single-concept");
            const singleObs = TestObservationFactory.create({concept: singleConcept, valueJSON: new PrimitiveValue("a.jpg", Concept.dataType.Image, nonDefaultSource)});
            const singleHolder = new ObservationsHolder([singleObs]);
            assert.isTrue(singleHolder.replaceMediaObservation("a.jpg", "u.jpg", singleConcept.uuid));
            assert.equal(singleHolder.observations[0].valueJSON.answerSource, nonDefaultSource);
        });

        it('writes the concept-appropriate wrapper for a single-value media replace', function () {
            const concept = EntityFactory.createConcept("Image", Concept.dataType.Image, "media-concept");
            const obs = TestObservationFactory.create({concept, valueJSON: new PrimitiveValue("p.jpg", Concept.dataType.Image)});
            const observationsHolder = new ObservationsHolder([obs]);

            assert.isTrue(observationsHolder.replaceMediaObservation("p.jpg", "https://s3/p.jpg", concept.uuid));
            // Media concepts are select concepts (Concept.isMediaSelectConcept), so
            // getValueWrapperFor yields a SingleCodedValue — the shape every media write produces.
            assert.instanceOf(observationsHolder.observations[0].valueJSON, SingleCodedValue);
            assert.equal(observationsHolder.observations[0].getValue(), "https://s3/p.jpg");
        });

        it('does not throw on a malformed ImageV2 observation and still replaces a sibling', function () {
            const imageV2Concept = EntityFactory.createConcept("ImageV2", Concept.dataType.ImageV2, "imagev2-concept");
            const mediaConcept = EntityFactory.createConcept("Image", Concept.dataType.Image, "media-concept");

            const malformedObs = TestObservationFactory.create({concept: imageV2Concept, valueJSON: new PrimitiveValue("not-json", Concept.dataType.ImageV2)});
            const mediaObs = TestObservationFactory.create({concept: mediaConcept, valueJSON: new MultipleCodedValues(["t.jpg"])});
            const observationsHolder = new ObservationsHolder([malformedObs, mediaObs]);

            let replaced;
            assert.doesNotThrow(() => {
                replaced = observationsHolder.replaceMediaObservation("t.jpg", "u.jpg");
            });
            assert.isTrue(replaced);
            assert.deepEqual(observationsHolder.observations[1].valueJSON.answer, ["u.jpg"]);
        });

        it('returns false (no throw) when the only observation is a malformed ImageV2', function () {
            const imageV2Concept = EntityFactory.createConcept("ImageV2", Concept.dataType.ImageV2, "imagev2-concept");
            const malformedObs = TestObservationFactory.create({concept: imageV2Concept, valueJSON: new PrimitiveValue("not-json", Concept.dataType.ImageV2)});
            const observationsHolder = new ObservationsHolder([malformedObs]);

            let replaced;
            assert.doesNotThrow(() => {
                replaced = observationsHolder.replaceMediaObservation("t.jpg", "u.jpg");
            });
            assert.isFalse(replaced);
        });

        it('Encounter.replaceMediaObservation covers cancelObservations', function () {
            const concept = EntityFactory.createConcept("Image", Concept.dataType.Image, "media-concept");
            const cancelObs = TestObservationFactory.create({concept, valueJSON: new MultipleCodedValues(["c.jpg"])});

            const encounter = Encounter.createEmptyInstance();
            encounter.observations = [];
            encounter.cancelObservations = [cancelObs];

            assert.isTrue(encounter.replaceMediaObservation("c.jpg", "u.jpg", concept.uuid));
            assert.deepEqual(encounter.cancelObservations[0].valueJSON.answer, ["u.jpg"]);

            // value present in neither collection
            const encounter2 = Encounter.createEmptyInstance();
            encounter2.observations = [];
            encounter2.cancelObservations = [TestObservationFactory.create({concept, valueJSON: new MultipleCodedValues(["c.jpg"])})];
            assert.isFalse(encounter2.replaceMediaObservation("missing.jpg", "u.jpg", concept.uuid));
        });

        it('ProgramEnrolment.replaceMediaObservation covers programExitObservations', function () {
            const concept = EntityFactory.createConcept("Image", Concept.dataType.Image, "media-concept");
            const exitObs = TestObservationFactory.create({concept, valueJSON: new MultipleCodedValues(["e.jpg"])});

            const enrolment = ProgramEnrolment.createEmptyInstance();
            enrolment.observations = [];
            enrolment.programExitObservations = [exitObs];

            assert.isTrue(enrolment.replaceMediaObservation("e.jpg", "u.jpg", concept.uuid));
            assert.deepEqual(enrolment.programExitObservations[0].valueJSON.answer, ["u.jpg"]);

            // value present in neither collection
            const enrolment2 = ProgramEnrolment.createEmptyInstance();
            enrolment2.observations = [];
            enrolment2.programExitObservations = [TestObservationFactory.create({concept, valueJSON: new MultipleCodedValues(["e.jpg"])})];
            assert.isFalse(enrolment2.replaceMediaObservation("missing.jpg", "u.jpg", concept.uuid));
        });

        it('replace can rewrite everything the enqueue side finds (round-trip invariant)', function () {
            const topConcept = EntityFactory.createConcept("Top Image", Concept.dataType.Image, "top-concept");
            const qgConcept = EntityFactory.createConcept("Question Group", Concept.dataType.QuestionGroup, "qg-concept");
            const qgChildConcept = EntityFactory.createConcept("QG Image", Concept.dataType.Image, "qg-child-concept");
            const rqgConcept = EntityFactory.createConcept("Repeatable Group", Concept.dataType.QuestionGroup, "rqg-concept");
            const rqgChildConcept = EntityFactory.createConcept("RQG Image", Concept.dataType.Image, "rqg-child-concept");

            const topObs = TestObservationFactory.create({concept: topConcept, valueJSON: new MultipleCodedValues(["top.jpg"])});

            const qgChildObs = TestObservationFactory.create({concept: qgChildConcept, valueJSON: new MultipleCodedValues(["qgchild.jpg"])});
            const qgObs = new Observation();
            qgObs.concept = qgConcept;
            qgObs.valueJSON = new QuestionGroup([qgChildObs]);

            const rqgChildObs1 = TestObservationFactory.create({concept: rqgChildConcept, valueJSON: new MultipleCodedValues(["rqg1.jpg"])});
            const rqgChildObs2 = TestObservationFactory.create({concept: rqgChildConcept, valueJSON: new MultipleCodedValues(["rqg2.jpg"])});
            const rqgObs = new Observation();
            rqgObs.concept = rqgConcept;
            rqgObs.valueJSON = new RepeatableQuestionGroup([new QuestionGroup([rqgChildObs1]), new QuestionGroup([rqgChildObs2])]);

            const observations = [topObs, qgObs, rqgObs];

            const mediaObservations = findMediaObservations(observations);
            assert.isAbove(mediaObservations.length, 0);

            _.forEach(mediaObservations, (mediaObs) => {
                const isImageV2 = mediaObs.concept.datatype === Concept.dataType.ImageV2;
                const values = isImageV2 ? [] : _.flatten([mediaObs.getValue()]);
                _.forEach(values, (value) => {
                    assert.isTrue(new ObservationsHolder(observations).replaceMediaObservation(value, "u-" + value),
                        `expected replace to succeed for value ${value}`);
                });
            });
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
