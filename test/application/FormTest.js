import {assert} from 'chai';
import EntityFactory from "../EntityFactory";

function createForm1() {
  const form = EntityFactory.createForm('foo');
  const formElementGroup1 = EntityFactory.createFormElementGroup('bar', 1, form);
  formElementGroup1.addFormElement(EntityFactory.createFormElement('a1'));
  formElementGroup1.addFormElement(EntityFactory.createFormElement('a2'));

  const formElementGroup2 = EntityFactory.createFormElementGroup('bar1', 1, form);
  formElementGroup2.addFormElement(EntityFactory.createFormElement('b1'));
  const formElementG2E2 = EntityFactory.createFormElement('b2');
  formElementGroup2.addFormElement(formElementG2E2);
  return {form, formElementG2E2};
}

function createForm2() {
  const form = EntityFactory.createForm('foo');
  const formElementGroup1 = EntityFactory.createFormElementGroup('bar1', 1, form);
  let bar1a1Concept = EntityFactory.createConcept("bar1a1Concept", "Numeric", "ad2856b6-ab33-46f9-a9f4-67f9d5dac09e");
  formElementGroup1.addFormElement(EntityFactory.createFormElement('bar1a1', true, bar1a1Concept));
  let bar1a2Concept = EntityFactory.createConcept("bar1a2Concept", "Numeric", "6127cdea-310a-4ae6-9af8-8bae7614c9fa");
  formElementGroup1.addFormElement(EntityFactory.createFormElement('bar1a2', true, bar1a2Concept));

  const formElementGroup2 = EntityFactory.createFormElementGroup('bar2', 2, form);
  let bar2b1Concept = EntityFactory.createConcept("bar2b1Concept", "Numeric", "138a3a03-1a92-4b6c-ae4e-64b5af32dc74");
  formElementGroup2.addFormElement(EntityFactory.createFormElement('bar2b1', true, bar2b1Concept));
  let bar2b2Concept = EntityFactory.createConcept("bar2b2Concept", "Numeric", "955c0314-d02a-4e7b-a0a0-6a9d6189dcdd");
  formElementGroup2.addFormElement(EntityFactory.createFormElement('bar2b2', true, bar2b2Concept));
  return {form};
}

describe('Form', () => {
  it('can find an element within itself by name', () => {
    let {form, formElementG2E2} = createForm1();

    const foundFormElement = form.findFormElement('b2');
    assert.notEqual(foundFormElement, undefined);
    assert.equal(foundFormElement.uuid, formElementG2E2.uuid);
  });

  it("can remove an element within itself by name", () => {
    let {form, formElementG2E2} = createForm1();

    assert.equal(form.findFormElement('b2').uuid, formElementG2E2.uuid);
    assert.notEqual(form.findFormElement('a1'), undefined);

    const modifiedForm = form.removeFormElement('b2');

    assert.equal(modifiedForm.findFormElement('b2'), undefined);
  });

  it('should get all form element concepts', function () {
    const {form} = createForm2();
    const allFormElementConcepts = form.getAllFormElementConcepts();
    assert.equal(4, allFormElementConcepts.length);
  });

  it("Should return empty array if no observations", () => {
    const {form} = createForm2();

    let orderedObservations = form.orderObservations([]);
    assert.equal(0, orderedObservations.length)
  });

  it("Should return extra obs array if no observations", () => {
    const {form} = createForm2();

    const extraObs = EntityFactory.createObservation(EntityFactory.createConcept("ExtraObs", "Numeric", "b86c0222-ae51-4ac7-97bc-ec2a4efc483b"));

    let orderedObservations = form.orderObservations([extraObs]);
    assert.equal(1, orderedObservations.length);
    assert.equal("ExtraObs", orderedObservations[0].concept.name)
  });

  it("Should order observations according to the form display order", () => {
    const form = EntityFactory.createForm('foo');
    const formElementGroup1 = EntityFactory.createFormElementGroup('bar1', 1, form);
    let bar1a1Concept = EntityFactory.createConcept("bar1a1Concept", "Numeric", "ad2856b6-ab33-46f9-a9f4-67f9d5dac09e");
    formElementGroup1.addFormElement(EntityFactory.createFormElement('bar1a1', true, bar1a1Concept));
    const obs1 = EntityFactory.createObservation(bar1a1Concept);
    let bar1a2Concept = EntityFactory.createConcept("bar1a2Concept", "Numeric", "6127cdea-310a-4ae6-9af8-8bae7614c9fa");
    formElementGroup1.addFormElement(EntityFactory.createFormElement('bar1a2', true, bar1a2Concept));
    const obs2 = EntityFactory.createObservation(bar1a2Concept);

    const formElementGroup2 = EntityFactory.createFormElementGroup('bar2', 2, form);
    let bar2b1Concept = EntityFactory.createConcept("bar2b1Concept", "Numeric", "138a3a03-1a92-4b6c-ae4e-64b5af32dc74");
    formElementGroup2.addFormElement(EntityFactory.createFormElement('bar2b1', true, bar2b1Concept));
    const obs3 = EntityFactory.createObservation(bar2b1Concept);
    let bar2b2Concept = EntityFactory.createConcept("bar2b2Concept", "Numeric", "955c0314-d02a-4e7b-a0a0-6a9d6189dcdd");
    formElementGroup2.addFormElement(EntityFactory.createFormElement('bar2b2', true, bar2b2Concept));
    const obs4 = EntityFactory.createObservation(bar2b2Concept);

    const extraObs = EntityFactory.createObservation(EntityFactory.createConcept("ExtraObs", "Numeric", "b86c0222-ae51-4ac7-97bc-ec2a4efc483b"));

    let orderedObservations = form.orderObservations([obs3, obs4, extraObs, obs1, obs2]);
    assert.equal(bar1a1Concept.name, orderedObservations[0].concept.name);
    assert.equal(bar1a2Concept.name, orderedObservations[1].concept.name);
    assert.equal(bar2b1Concept.name, orderedObservations[2].concept.name);
    assert.equal(bar2b2Concept.name, orderedObservations[3].concept.name);
    assert.equal("ExtraObs", orderedObservations[4].concept.name);
  });

  it("Should group by FEG and order observations according to the form display order", () => {
    const form = EntityFactory.createForm('foo');
    const formElementGroup1 = EntityFactory.createFormElementGroup('bar1', 1, form);
    let bar1a1Concept = EntityFactory.createConcept("bar1a1Concept", "Numeric", "ad2856b6-ab33-46f9-a9f4-67f9d5dac09e");
    formElementGroup1.addFormElement(EntityFactory.createFormElement('bar1a1', true, bar1a1Concept,1));
    const obs1 = EntityFactory.createObservation(bar1a1Concept);
    let bar1a2Concept = EntityFactory.createConcept("bar1a2Concept", "Numeric", "6127cdea-310a-4ae6-9af8-8bae7614c9fa");
    formElementGroup1.addFormElement(EntityFactory.createFormElement('bar1a2', true, bar1a2Concept,2));
    const obs2 = EntityFactory.createObservation(bar1a2Concept);

    const formElementGroup2 = EntityFactory.createFormElementGroup('bar2', 2, form);
    let bar2b1Concept = EntityFactory.createConcept("bar2b1Concept", "Numeric", "138a3a03-1a92-4b6c-ae4e-64b5af32dc74");
    formElementGroup2.addFormElement(EntityFactory.createFormElement('bar2b1', true, bar2b1Concept,3));
    const obs3 = EntityFactory.createObservation(bar2b1Concept);
    let bar2b2Concept = EntityFactory.createConcept("bar2b2Concept", "Numeric", "955c0314-d02a-4e7b-a0a0-6a9d6189dcdd");
    formElementGroup2.addFormElement(EntityFactory.createFormElement('bar2b2', true, bar2b2Concept,4));
    const obs4 = EntityFactory.createObservation(bar2b2Concept);

    const extraObs = EntityFactory.createObservation(EntityFactory.createConcept("ExtraObs", "Numeric", "b86c0222-ae51-4ac7-97bc-ec2a4efc483b"));

    let orderedObservationsPerFEG = form.orderObservationsPerFEG([obs3, obs4, extraObs, obs1, obs2]);

    assert.equal(orderedObservationsPerFEG.length, 2);
    assert.equal(formElementGroup1.uuid, orderedObservationsPerFEG[0].uuid);
    assert.equal(formElementGroup2.uuid, orderedObservationsPerFEG[1].uuid);
    assert.isNotNull(orderedObservationsPerFEG[0].feg);
    assert.isNotNull(orderedObservationsPerFEG[1].feg);
    assert.equal(formElementGroup1.name, orderedObservationsPerFEG[0].feg.name);
    assert.equal(formElementGroup2.name, orderedObservationsPerFEG[1].feg.name);
    assert.equal(orderedObservationsPerFEG[0].sortedObservationsArray.length, 2);
    assert.equal(orderedObservationsPerFEG[1].sortedObservationsArray.length, 2);
    assert.equal(bar1a1Concept.name, orderedObservationsPerFEG[0].sortedObservationsArray[0].concept.name);
    assert.equal(bar1a2Concept.name, orderedObservationsPerFEG[0].sortedObservationsArray[1].concept.name);
    assert.equal(bar2b1Concept.name, orderedObservationsPerFEG[1].sortedObservationsArray[0].concept.name);
    assert.equal(bar2b2Concept.name, orderedObservationsPerFEG[1].sortedObservationsArray[1].concept.name);

  });
});
