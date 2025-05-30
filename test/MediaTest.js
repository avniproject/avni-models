import {assert} from "chai";
import EntityFactory from "./EntityFactory";
import Concept from "../src/Concept";
import Observation from "../src/Observation";
import QuestionGroup from "../src/observation/QuestionGroup";
import RepeatableQuestionGroup from "../src/observation/RepeatableQuestionGroup";
import { findMediaObservations } from "../src/Media";

describe('Media', () => {
    describe('findMediaObservations', () => {
        let mediaConcept1, mediaConcept2, qgConcept, rqgConcept;

        beforeEach(() => {
            // Create media concepts
            mediaConcept1 = EntityFactory.createConcept("Image 1", Concept.dataType.Image, "media-1");
            mediaConcept2 = EntityFactory.createConcept("Image 2", Concept.dataType.Image, "media-2");
            qgConcept = EntityFactory.createConcept("QG", Concept.dataType.QuestionGroup, "qg-1");
            rqgConcept = EntityFactory.createConcept("RQG", Concept.dataType.QuestionGroup, "rqg-1");
        });

        it('should find media observations at the top level', () => {
            // Create a media observation
            const mediaObs = new Observation();
            mediaObs.concept = mediaConcept1;
            mediaObs.valueJSON = {answer: ["test_image.jpg"]};

            // Find media observations
            const mediaObservations = findMediaObservations([mediaObs]);

            assert.equal(mediaObservations.length, 1);
            assert.equal(mediaObservations[0].concept.uuid, mediaConcept1.uuid);
        });

        it('should find media observations inside a QuestionGroup', () => {
            // Create a media observation
            const mediaObs = new Observation();
            mediaObs.concept = mediaConcept1;
            mediaObs.valueJSON = {answer: ["test_image.jpg"]};

            // Create a question group with the media observation
            const group = new QuestionGroup([mediaObs]);

            // Create the QuestionGroup observation
            const qgObservation = new Observation();
            qgObservation.concept = qgConcept;
            qgObservation.valueJSON = group;

            // Find media observations
            const mediaObservations = findMediaObservations([qgObservation]);

            assert.equal(mediaObservations.length, 1);
            assert.equal(mediaObservations[0].concept.uuid, mediaConcept1.uuid);
        });

        it('should find media observations inside a RepeatableQuestionGroup', () => {
            // Create a media observation
            const mediaObs = new Observation();
            mediaObs.concept = mediaConcept1;
            mediaObs.valueJSON = {answer: ["test_image.jpg"]};

            // Create a question group with the media observation
            const group = new QuestionGroup([mediaObs]);

            // Create the repeatable question group containing the group
            const repeatableGroup = new RepeatableQuestionGroup([group]);

            // Create the observation with the repeatable question group
            const rqgObservation = new Observation();
            rqgObservation.concept = rqgConcept;
            rqgObservation.valueJSON = repeatableGroup;

            // Find media observations
            const mediaObservations = findMediaObservations([rqgObservation]);

            assert.equal(mediaObservations.length, 1);
            assert.equal(mediaObservations[0].concept.uuid, mediaConcept1.uuid);
        });

        it('should find multiple media observations across different nesting levels', () => {
            // Create top-level media observation
            const topMediaObs = new Observation();
            topMediaObs.concept = mediaConcept1;
            topMediaObs.valueJSON = {answer: ["top_image.jpg"]};

            // Create nested media observation
            const nestedMediaObs = new Observation();
            nestedMediaObs.concept = mediaConcept2;
            nestedMediaObs.valueJSON = {answer: ["nested_image.jpg"]};

            // Create a question group with the media observation
            const group = new QuestionGroup([nestedMediaObs]);

            // Create the repeatable question group containing the group
            const repeatableGroup = new RepeatableQuestionGroup([group]);

            // Create the observation with the repeatable question group
            const rqgObservation = new Observation();
            rqgObservation.concept = rqgConcept;
            rqgObservation.valueJSON = repeatableGroup;

            // Find media observations
            const mediaObservations = findMediaObservations([topMediaObs, rqgObservation]);

            assert.equal(mediaObservations.length, 2);
            assert.sameMembers(
                mediaObservations.map(obs => obs.concept.uuid),
                [mediaConcept1.uuid, mediaConcept2.uuid]
            );
        });

        it('should handle multiple groups within a RepeatableQuestionGroup', () => {
            // Create media observations
            const mediaObs1 = new Observation();
            mediaObs1.concept = mediaConcept1;
            mediaObs1.valueJSON = {answer: ["image1.jpg"]};

            const mediaObs2 = new Observation();
            mediaObs2.concept = mediaConcept2;
            mediaObs2.valueJSON = {answer: ["image2.jpg"]};

            // Create two question groups each with a media observation
            const group1 = new QuestionGroup([mediaObs1]);
            const group2 = new QuestionGroup([mediaObs2]);

            // Create the repeatable question group containing both groups
            const repeatableGroup = new RepeatableQuestionGroup([group1, group2]);

            // Create the observation with the repeatable question group
            const rqgObservation = new Observation();
            rqgObservation.concept = rqgConcept;
            rqgObservation.valueJSON = repeatableGroup;

            // Find media observations
            const mediaObservations = findMediaObservations([rqgObservation]);

            assert.equal(mediaObservations.length, 2);
            assert.sameMembers(
                mediaObservations.map(obs => obs.concept.uuid),
                [mediaConcept1.uuid, mediaConcept2.uuid]
            );
        });

        it('should handle empty observations arrays', () => {
            const mediaObservations = findMediaObservations([]);
            assert.equal(mediaObservations.length, 0);
        });

        it('should handle null observations', () => {
            const mediaObservations = findMediaObservations(null);
            assert.equal(mediaObservations.length, 0);
        });

        it('should handle undefined observations', () => {
            const mediaObservations = findMediaObservations(undefined);
            assert.equal(mediaObservations.length, 0);
        });

        it('should handle non-media observations', () => {
            const textConcept = EntityFactory.createConcept("Text", Concept.dataType.Text, "text-1");
            const textObs = new Observation();
            textObs.concept = textConcept;
            textObs.valueJSON = "Some text";

            const mediaObservations = findMediaObservations([textObs]);
            assert.equal(mediaObservations.length, 0);
        });
    });
});
