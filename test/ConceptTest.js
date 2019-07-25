import {assert} from 'chai';
import { Concept, ConceptAnswer } from "../src";
import _ from "lodash";

describe('ConceptTest', () => {
    let createNumericConcept = function (lowAbsolute, hiAbsolute, lowNormal, hiNormal) {
        const concept = new Concept();
        concept.datatype = Concept.dataType.Numeric;
        concept.lowAbsolute = lowAbsolute;
        concept.hiAbsolute = hiAbsolute;
        concept.lowNormal = lowNormal;
        concept.hiNormal = hiNormal;
        return concept;
    };

    let createCodedConcept = function () {
        const concept = new Concept();
        concept.datatype = Concept.dataType.Coded;
        concept.answers = [
            {
                concept:
                    {uuid: '5a738df9-b09a-4e7d-b683-189a9cdabcad', name: 'Pregnancy Induced Hypertension', datatype: 'NA'},
                answerOrder: 1,
                abnormal: true
            },
            {
                concept:
                    {uuid: Concept.StandardConcepts.OtherConceptUUID, name: 'Other', datatype: 'NA'},
                answerOrder: 2,
                abnormal: true
            },
            {
                concept:
                    {uuid: '2f819f63-2a99-4719-a0c5-49e1386194a0', name: 'Underweight', datatype: 'NA'},
                answerOrder: 3,
                abnormal: false
            }
        ];
        return concept;
    };

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


  it("can create concept from json", () => {
    const concept = Concept.fromJson(sampleJson);

    assert.equal(concept.name, "Caste Category");
    assert.equal(concept.uuid, "61ab6413-5c6a-4512-ab6e-7d5cd1439569");
    assert.equal(concept.voided, false);
    assert.equal(concept.datatype, 'Coded');
    assert.equal(concept.hiAbsolute, null);
    assert.equal(concept.lowAbsolute, null);
    assert.equal(concept.lowNormal, null);
    assert.equal(concept.hiNormal, null);

    assert.equal(concept.answers.length, 3);
    assert.equal(concept.answers[0].constructor, ConceptAnswer);
  });

  it("can create concept's answers from json", () => {
    const conceptAnswer = ConceptAnswer.fromJson(sampleJson.conceptAnswers[0]);

    assert.equal(conceptAnswer.uuid, 'fe41d8ec-ae5e-4054-963b-f7a1768fb629');
    assert.equal(conceptAnswer.concept.uuid, 'cae99772-b389-4baf-849b-9c7c2b06c951');
    assert.equal(conceptAnswer.answerOrder, 4);
    assert.equal(conceptAnswer.abnormal, false);
    assert.equal(conceptAnswer.unique, false);
    assert.equal(conceptAnswer.voided, false);
  });
});

const sampleJson = {
  "uuid": "61ab6413-5c6a-4512-ab6e-7d5cd1439569",
  "dataType": "Coded",
  "conceptAnswers": [{
    "uuid": "fe41d8ec-ae5e-4054-963b-f7a1768fb629",
    "unique": false,
    "order": 4,
    "answerConcept": {
      "uuid": "cae99772-b389-4baf-849b-9c7c2b06c951",
      "dataType": "NA",
      "voided": false,
      "highAbsolute": null,
      "lowAbsolute": null,
      "highNormal": null,
      "lowNormal": null,
      "name": "General"
    },
    "abnormal": false
  }, {
    "unique": false,
    "order": 1,
    "answerConcept": {
      "uuid": "dd076e03-68ae-4b53-adf6-641c69b9a518",
      "dataType": "NA",
      "voided": false,
      "highAbsolute": null,
      "lowAbsolute": null,
      "highNormal": null,
      "lowNormal": null,
      "name": "ST"
    },
    "abnormal": false
  }, {
    "unique": false,
    "order": 2,
    "answerConcept": {
      "uuid": "a3519a96-350e-4da4-90d9-827c0ff15538",
      "dataType": "NA",
      "voided": false,
      "highAbsolute": null,
      "lowAbsolute": null,
      "highNormal": null,
      "lowNormal": null,
      "name": "SC"
    },
    "abnormal": false
  }],
  "voided": false,
  "highAbsolute": null,
  "lowAbsolute": null,
  "highNormal": null,
  "lowNormal": null,
  "name": "Caste Category"
};
