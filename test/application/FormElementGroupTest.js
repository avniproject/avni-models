import {assert} from "chai";
import EntityFactory from "../EntityFactory";
import Concept from '../../src/Concept';
import FormElement from "openchs-models/src/application/FormElement";
import FormElementStatus from "../../src/application/FormElementStatus";
import FormElementGroup from "../../src/application/FormElementGroup";
import Form from "../../src/application/Form";

describe('FormElementGroupTest', () => {
    it('previous and next', () => {
        const form = EntityFactory.createForm('form1');
        const first = EntityFactory.createFormElementGroup('foo', 1, form);
        const second = EntityFactory.createFormElementGroup('bar', 2, form);
        const third = EntityFactory.createFormElementGroup('baz', 3, form);

        assert.notEqual(first.next(), undefined);
        assert.notEqual(second.next(), undefined);
        assert.equal(third.next(), undefined);

        assert.equal(first.previous(), undefined);
        assert.notEqual(third.previous(), undefined);
        assert.notEqual(second.previous(), undefined);

        assert.equal(first.isFirst, true);
        assert.equal(second.isFirst, false);
    });

    it('getFormElements', () => {
        const form = EntityFactory.createForm('form1');
        const formElementGroup = EntityFactory.createFormElementGroup('foo', 1, form);
        formElementGroup.addFormElement(EntityFactory.createFormElement("bar", false, EntityFactory.createConcept("bar", Concept.dataType.Text), 2));
        formElementGroup.addFormElement(EntityFactory.createFormElement("baz", false, EntityFactory.createConcept("bar", Concept.dataType.Text), 1));
        assert.equal(formElementGroup.getFormElements().length, 2);
    });

    it('filterElements', () => {
        let formElements = [createFormElement('ABCD'), createFormElement('EFGH'), createFormElement('IJKL')];
        let formElementStatuses = [new FormElementStatus('ABCD', true, 1), new FormElementStatus('EFGH', false, 1), new FormElementStatus('IJKL', true, 1)];
        let formElementGroup = new FormElementGroup();
        formElementGroup.formElements = formElements;
        let filteredElements = formElementGroup.filterElements(formElementStatuses);
        assert.equal(filteredElements.length, 2);
    });

    it('filterElementAnswers', () => {
        let formElements = [createFormElement('ABCD', ["Answer 1", "Answer 2"]), createFormElement('EFGH'), createFormElement('IJKL', ["Answer 3", "Answer 4"])];
        let formElementStatuses = [new FormElementStatus('ABCD', true, 1, ["Answer 1"]), new FormElementStatus('EFGH', false, 1), new FormElementStatus('IJKL', true, 1, ["Answer 3", "Answer 4"])];
        let formElementGroup = new FormElementGroup();
        formElementGroup.formElements = formElements;
        let filteredElements = formElementGroup.filterElements(formElementStatuses);
        assert.equal(filteredElements[0].answersToExclude.length, 1);
        assert.equal(filteredElements[1].answersToExclude.length, 2);
    });

    function createFormElement(uuid, answers = []) {
        let x = new FormElement();
        x.uuid = uuid;
        x.getRawAnswers = function () {
            return answers;
        }
        return x;
    }

  it("can create from json", () => {
    const form = {};
    const feg = FormElementGroup.fromJson(sampleJson, form);

    assert.equal(feg.name, "Individual details");
    assert.equal(feg.uuid, "01ec7a55-3204-4518-bfaf-996e44c44243");
    assert.equal(feg.displayOrder, 2);
    assert.equal(feg.voided, false);
    assert.equal(feg.formElements.length, 3);
  });
});

const sampleJson = {
  "uuid": "01ec7a55-3204-4518-bfaf-996e44c44243",
  "applicableFormElements": [{
    "mandatory": true,
    "uuid": "828e27a6-28f0-4cdb-bc02-972d31389c36",
    "concept": {
      "uuid": "38eaf459-4316-4da3-acfd-3c9c71334041",
      "dataType": "Numeric",
      "conceptAnswers": [],
      "voided": false,
      "highAbsolute": null,
      "lowAbsolute": null,
      "highNormal": null,
      "lowNormal": null,
      "name": "Standard upto which schooling completed"
    },
    "voided": false,
    "displayOrder": 5,
    "keyValues": [],
    "validFormat": null,
    "name": "Standard upto which schooling completed",
    "type": "SingleSelect"
  }, {
    "mandatory": true,
    "uuid": "e0cbda04-4ee4-49e5-bdc5-85efdfd3640c",
    "concept": {
      "uuid": "60c44aa2-3635-487d-8962-43000e77d382",
      "dataType": "Text",
      "conceptAnswers": [],
      "voided": false,
      "highAbsolute": null,
      "lowAbsolute": null,
      "highNormal": null,
      "lowNormal": null,
      "name": "Caste (Free Text)"
    },
    "voided": false,
    "displayOrder": 2.5,
    "keyValues": [],
    "validFormat": null,
    "name": "Caste",
    "type": "SingleSelect"
  }, {
    "mandatory": false,
    "uuid": "14f3babd-1e75-432a-ad42-f5a94eac2059",
    "concept": {
      "uuid": "61ab6413-5c6a-4512-ab6e-7d5cd1439569",
      "dataType": "Coded",
      "conceptAnswers": [{
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
      }, {
        "unique": false,
        "order": 3,
        "answerConcept": {
          "uuid": "e92925ed-4a15-40c0-a0a7-a21c965dad48",
          "dataType": "NA",
          "voided": false,
          "highAbsolute": null,
          "lowAbsolute": null,
          "highNormal": null,
          "lowNormal": null,
          "name": "OBC"
        },
        "abnormal": false
      }],
      "voided": false,
      "highAbsolute": null,
      "lowAbsolute": null,
      "highNormal": null,
      "lowNormal": null,
      "name": "Caste Category"
    },
    "voided": false,
    "displayOrder": 3,
    "keyValues": [],
    "validFormat": null,
    "name": "Caste category",
    "type": "SingleSelect"
  }],
  "voided": false,
  "displayOrder": 2,
  "name": "Individual details"
};
