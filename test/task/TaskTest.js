import TestTaskFactory from "../ref/TestTaskFactory";
import EntityFactory from "../EntityFactory";
import Concept from "../../src/Concept";
import {assert} from 'chai';
import KeyValue from "../../src/application/KeyValue";
import TestKeyValueFactory from "../ref/TestKeyValueFactory";

it('should get non phone number obs values', function () {
  const concept1 = EntityFactory.createConcept("C1", Concept.dataType.Numeric, "c-uuid-1");
  const concept2 = EntityFactory.createConcept("C2", Concept.dataType.PhoneNumber, "c-uuid-1");
  const keyValue = TestKeyValueFactory.create({key: KeyValue.PrimaryContactKey, value: KeyValue.ContactYesValue});
  concept2.keyValues.push(keyValue);
  const metadataObs1 = EntityFactory.createObservation(concept1, 10);
  const metadataObs2 = EntityFactory.createObservation(concept2, "9090909090");
  const task = TestTaskFactory.create({metadata: [metadataObs1, metadataObs2]});
  const nonPhoneNumberMetadataObservationValues = task.getNonMobileNumberMetadataObservationValues();
  assert.equal(nonPhoneNumberMetadataObservationValues.length, 1);
  assert.equal(nonPhoneNumberMetadataObservationValues[0], "10");
});
