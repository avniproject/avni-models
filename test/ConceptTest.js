import {assert} from 'chai';
import Concept from "../src/Concept";
import ConceptAnswer from "../src/ConceptAnswer";
import _ from "lodash";

describe('ConceptTest', () => {


    it('violatesRange for concept with range', () => {
        const concept = createNumericConcept(10, 65);
        assert.isFalse(concept.violatesRange("a"));
        assert.isFalse(concept.violatesRange(20));
        assert.isFalse(concept.violatesRange(10));
        assert.isFalse(concept.violatesRange(65));
        assert.isTrue(concept.violatesRange(5));
        assert.isTrue(concept.violatesRange(66));
    });

    it('violatesRange for concept without range', () => {
        const concept = new Concept();
        concept.datatype = Concept.dataType.Numeric;
        assert.isFalse(concept.violatesRange(20));
        assert.isFalse(concept.violatesRange());
        assert.isFalse(concept.violatesRange(null));
        assert.isFalse(concept.violatesRange("1"));
    });

    it("isAbnormal shows abnormal when ranges provided", () => {
        const concept = createNumericConcept(10, 20, 5, 50);
        assert.isTrue(concept.isAbnormal(4));
        assert.isFalse(concept.isAbnormal(5));
        assert.isFalse(concept.isAbnormal(6));
        assert.isFalse(concept.isAbnormal(49));
        assert.isFalse(concept.isAbnormal(50));
        assert.isTrue(concept.isAbnormal(51));
    });

    it("isAbnormal shows abnormal when ranges partially provided", () => {
        let concept;
        concept = createNumericConcept(10, 20, null, 50);
        assert.isFalse(concept.isAbnormal(4));
        assert.isFalse(concept.isAbnormal(5));
        assert.isFalse(concept.isAbnormal(6));
        assert.isFalse(concept.isAbnormal(49));
        assert.isFalse(concept.isAbnormal(50));
        assert.isTrue(concept.isAbnormal(51));

        concept = createNumericConcept(10, 20, 5, null);
        assert.isTrue(concept.isAbnormal(4));
        assert.isFalse(concept.isAbnormal(5));
        assert.isFalse(concept.isAbnormal(6));
        assert.isFalse(concept.isAbnormal(49));
        assert.isFalse(concept.isAbnormal(50));
        assert.isFalse(concept.isAbnormal(51));
    });

    it("isAbnormal shows abnormal for coded concept observation when answer is abnormal", () => {
        let concept = createCodedConcept();
        assert.isTrue(concept.isAbnormal(['5a738df9-b09a-4e7d-b683-189a9cdabcad']));
        assert.isFalse(concept.isAbnormal(['2f819f63-2a99-4719-a0c5-49e1386194a0']));
        assert.isTrue(concept.isAbnormal(['2f819f63-2a99-4719-a0c5-49e1386194a0', '5a738df9-b09a-4e7d-b683-189a9cdabcad']));
        assert.isTrue(concept.isAbnormal('5a738df9-b09a-4e7d-b683-189a9cdabcad'));
        assert.isFalse(concept.isAbnormal('2f819f63-2a99-4719-a0c5-49e1386194a0'));
    });

    it('other should be the last answer', function () {
        let concept = createCodedConcept();
        let lastConceptAnswer = _.last(concept.getAnswers());
        let otherConceptUUID = Concept.StandardConcepts.OtherConceptUUID;
        assert.equal(lastConceptAnswer.concept.uuid, otherConceptUUID);
    });

});

let createNumericConcept = function (lowAbsolute, hiAbsolute, lowNormal, hiNormal) {
    const concept = new Concept();
    concept.datatype = Concept.dataType.Numeric;
    concept.lowAbsolute = lowAbsolute;
    concept.hiAbsolute = hiAbsolute;
    concept.lowNormal = lowNormal;
    concept.hiNormal = hiNormal;
    return concept;
};

function createConcept({uuid, name, datatype}) {
    let concept = new Concept();
    concept.uuid = uuid;
    concept.name = name;
    concept.datatype = datatype;
    return concept;
};

function createAnswer({uuid, concept, answerOrder, abnormal}) {
    let conceptAnswer = new ConceptAnswer();
    conceptAnswer.uuid = uuid
    conceptAnswer.concept = concept;
    conceptAnswer.answerOrder = answerOrder;
    conceptAnswer.abnormal = abnormal;
    return conceptAnswer;
}

let createCodedConcept = function (name = '') {
    const concept = new Concept();
    concept.name = name;
    concept.uuid = name;
    concept.datatype = Concept.dataType.Coded;
    concept.answers = [
        createAnswer({
            uuid: '5a738df9-b09a-4e7d-b683-189a9cdabcad',
            concept:
              createConcept({uuid: '5a738df9-b09a-4e7d-b683-189a9cdabcad', name: 'Pregnancy Induced Hypertension', datatype: 'NA'}),
            answerOrder: 1,
            abnormal: true
        }),
        createAnswer({
            uuid: Concept.StandardConcepts.OtherConceptUUID,
            concept:
              createConcept({uuid: Concept.StandardConcepts.OtherConceptUUID, name: 'Other', datatype: 'NA'}),
            answerOrder: 2,
            abnormal: true
        }),
        createAnswer({
            uuid: '2f819f63-2a99-4719-a0c5-49e1386194a0',
            concept:
              createConcept({uuid: '2f819f63-2a99-4719-a0c5-49e1386194a0', name: 'Underweight', datatype: 'NA'}),
            answerOrder: 3,
            abnormal: false
        })
    ];
    return concept;
};

export {createCodedConcept};