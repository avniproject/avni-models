import General from "../../src/utility/General";
import {Concept, Encounter} from "../../src";
import {assert} from 'chai';
import TestConceptFactory from "../ref/TestConceptFactory";
import { when } from "jest-when";

it('should assign obs field with QG', function () {
  const concept1 = TestConceptFactory.create({uuid: "group-concept-uuid-1", dataType: Concept.dataType.QuestionGroup});
  const concept2 = TestConceptFactory.create({uuid: "concept-uuid-2", dataType: Concept.dataType.Numeric});
  const concept3 = TestConceptFactory.create({uuid: "concept-uuid-3", dataType: Concept.dataType.Text});
  const fn = jest.fn();
  when(fn).calledWith("uuid", "group-concept-uuid-1", Concept.schema.name).mockReturnValue(concept1);
  when(fn).calledWith("uuid", "concept-uuid-2", Concept.schema.name).mockReturnValue(concept2);
  when(fn).calledWith("uuid", "concept-uuid-3", Concept.schema.name).mockReturnValue(concept3);
  const entityService = {
    findByKey: fn
  };

  const resource = {
    "observations": {
      "group-concept-uuid-1": {
        "concept-uuid-2": 5,
        "concept-uuid-3": "abc"
      }
    }
  };
  const encounter = new Encounter();
  General.assignObsFields(resource, encounter, ["observations"], entityService);
  assert.equal(encounter.observations.length, 1);
  assert.isFalse(encounter.observations[0].valueJSON.includes("that"));
  const groupObsValueWrapper = encounter.observations[0].getValueWrapper();
  assert.equal(2, groupObsValueWrapper.groupObservations.length);

  assert.equal(5, groupObsValueWrapper.groupObservations[0].getValueWrapper().value);
  assert.equal("abc", groupObsValueWrapper.groupObservations[1].getValueWrapper().value);
});
