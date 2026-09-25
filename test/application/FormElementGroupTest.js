import {assert} from "chai";
import EntityFactory from "../EntityFactory";
import Concept from '../../src/Concept';
import FormElement from "openchs-models/src/application/FormElement";
import FormElementStatus from "../../src/application/FormElementStatus";
import FormElementGroup from "../../src/application/FormElementGroup";
import ObservationsHolder from "../../src/ObservationsHolder";
import _ from 'lodash';
import KeyValue from "../../src/application/KeyValue";
import QuestionGroup from "../../src/observation/QuestionGroup";
import RepeatableQuestionGroup from "../../src/observation/RepeatableQuestionGroup";
import Observation from "../../src/Observation";

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

    it('returnFalseIfAllFormElementsAreNotEmpty', () => {
        let observations, concepts, allFormElements;
        concepts = [EntityFactory.createConcept("Concept 1", Concept.dataType.Coded, "concept-1"),
          EntityFactory.createConcept("Concept 2", Concept.dataType.Coded, "concept-2")];
        observations = [EntityFactory.createObservation(concepts[0], "Yao")];
        const observationsHolder = new ObservationsHolder(observations);
        allFormElements = [
          EntityFactory.createFormElement("Form Element 1", true, concepts[0], 1, "SingleSelect"),
          EntityFactory.createFormElement("Form Element 2", true, concepts[1], 2, "SingleSelect")
        ];
        const form = EntityFactory.createForm('form1');
        const formElementGroup = EntityFactory.createFormElementGroup('foo', 1, form);
        formElementGroup.addFormElement(allFormElements[0]);
        formElementGroup.addFormElement(allFormElements[1]);

        const isEmpty = formElementGroup.areAllFormElementsEmpty(allFormElements, observationsHolder);

        assert.isFalse(isEmpty);
    });

    it('returnTrueIfAllFormElementsAreEmpty', () => {
        let observations, concepts, allFormElements;
        concepts = [EntityFactory.createConcept("Concept 1", Concept.dataType.Coded, "concept-1"),
          EntityFactory.createConcept("Concept 2", Concept.dataType.Coded, "concept-2")];
        observations = [];
        const observationsHolder = new ObservationsHolder(observations);
        allFormElements = [
          EntityFactory.createFormElement("Form Element 1", true, concepts[0], 1, "SingleSelect"),
          EntityFactory.createFormElement("Form Element 2", true, concepts[1], 2, "SingleSelect")
        ];
        const form = EntityFactory.createForm('form1');
        const formElementGroup = EntityFactory.createFormElementGroup('foo', 1, form);
        formElementGroup.addFormElement(allFormElements[0]);
        formElementGroup.addFormElement(allFormElements[1]);

        const isEmpty = formElementGroup.areAllFormElementsEmpty(allFormElements, observationsHolder);

        assert.isTrue(isEmpty);
    });

    it('findNonVoidedFormElements', () => {
        let formElements = _.range(10000).map(idx => createFormElement('ABC'+idx, [],
          idx % 10===0, idx % 5 === 0 && idx - 5 > 0 ? idx - 5 : null ));
        let formElementGroup = new FormElementGroup();
        formElementGroup.formElements = formElements;
        let startTime = performance.now()
        let nonVoidedFormElements = formElementGroup.nonVoidedFormElements();
        let endTime = performance.now()
        assert.equal(nonVoidedFormElements.length, 9000);
        //on local should be less than 100ms
        // assert.isTrue(endTime - startTime < 300, 'Test should have completed within 100 milliseconds');
    });

    describe('validate skips hidden concepts', () => {
        const hiddenKeyValues = [{key: KeyValue.HiddenKey, value: "true"}];

        function concept(name, dataType, keyValues = []) {
            return Concept.create(name, dataType, keyValues, name);
        }

        function failures(results) {
            return _.filter(results, r => !r.success);
        }

        function groupWith(...formElements) {
            const form = EntityFactory.createForm('form1');
            const formElementGroup = EntityFactory.createFormElementGroup('page', 1, form);
            formElements.forEach(fe => formElementGroup.addFormElement(fe));
            return formElementGroup;
        }

        it('a required question on a hidden concept with no answer raises no error', () => {
            const hidden = concept("AI Verdict", Concept.dataType.Text, hiddenKeyValues);
            const fe = EntityFactory.createFormElement("AI Verdict", true, hidden, 1);
            const results = groupWith(fe).validate(new ObservationsHolder([]), [fe]);

            assert.isEmpty(results, "a hidden element must produce no result at all");
        });

        it('a required question on a visible concept with no answer is still blocked', () => {
            const visible = concept("Worker Assessment", Concept.dataType.Text);
            const fe = EntityFactory.createFormElement("Worker Assessment", true, visible, 1);
            const results = groupWith(fe).validate(new ObservationsHolder([]), [fe]);

            assert.lengthOf(failures(results), 1);
            assert.equal(failures(results)[0].messageKey, "emptyValidationMessage");
            assert.equal(failures(results)[0].formIdentifier, fe.uuid);
        });

        it('a hidden numeric answer outside its absolute range raises no error', () => {
            const hidden = concept("Hidden Score", Concept.dataType.Numeric, hiddenKeyValues);
            hidden.lowAbsolute = 0;
            hidden.hiAbsolute = 1;
            const fe = EntityFactory.createFormElement("Hidden Score", false, hidden, 1);
            const holder = new ObservationsHolder([EntityFactory.createObservation(hidden, 5)]);

            assert.isEmpty(groupWith(fe).validate(holder, [fe]));
        });

        it('a visible numeric answer outside its absolute range is still an error', () => {
            const visible = concept("Visible Score", Concept.dataType.Numeric);
            visible.lowAbsolute = 0;
            visible.hiAbsolute = 1;
            const fe = EntityFactory.createFormElement("Visible Score", false, visible, 1);
            const holder = new ObservationsHolder([EntityFactory.createObservation(visible, 5)]);
            const results = groupWith(fe).validate(holder, [fe]);

            assert.lengthOf(failures(results), 1);
            assert.equal(failures(results)[0].messageKey, "numberAboveHiAbsolute");
        });

        it('only the hidden element drops out when a page mixes hidden and visible', () => {
            const hidden = concept("AI Verdict", Concept.dataType.Text, hiddenKeyValues);
            const visible = concept("Worker Assessment", Concept.dataType.Text);
            const hiddenFe = EntityFactory.createFormElement("AI Verdict", true, hidden, 1);
            const visibleFe = EntityFactory.createFormElement("Worker Assessment", true, visible, 2);
            const results = groupWith(hiddenFe, visibleFe).validate(new ObservationsHolder([]), [hiddenFe, visibleFe]);

            assert.lengthOf(results, 1);
            assert.equal(results[0].formIdentifier, visibleFe.uuid);
            assert.isFalse(results[0].success);
        });

        it('a hidden child inside a repeatable group raises no error in either row', () => {
            const groupConcept = concept("Lesion", Concept.dataType.QuestionGroup);
            const hidden = concept("AI Verdict", Concept.dataType.Text, hiddenKeyValues);
            const visible = concept("Site", Concept.dataType.Text);

            const groupFe = EntityFactory.createFormElement("Lesion", false, groupConcept, 1);
            groupFe.keyValues = [KeyValue.fromResource({key: "repeatable", value: true})];
            assert.isTrue(groupFe.repeatable, "fixture: the group must read as repeatable");
            const hiddenChild = EntityFactory.createFormElement("AI Verdict", true, hidden, 1);
            hiddenChild.groupUuid = groupFe.uuid;
            const visibleChild = EntityFactory.createFormElement("Site", true, visible, 2);
            visibleChild.groupUuid = groupFe.uuid;

            // Two rows. Row 0 has the visible answer filled; row 1 has nothing.
            const row0 = new QuestionGroup([EntityFactory.createObservation(visible, "Tongue")]);
            const row1 = new QuestionGroup([]);
            const groupObs = Observation.create(groupConcept, new RepeatableQuestionGroup([row0, row1]));
            const holder = new ObservationsHolder([groupObs]);

            const results = groupWith(groupFe, hiddenChild, visibleChild)
                .validate(holder, [groupFe, hiddenChild, visibleChild]);

            assert.isEmpty(_.filter(results, r => r.formIdentifier === hiddenChild.uuid),
                "the hidden child must produce no result in any row");
            const visibleFailures = _.filter(failures(results), r => r.formIdentifier === visibleChild.uuid);
            assert.lengthOf(visibleFailures, 1, "the visible child is still required in the empty row");
            assert.equal(visibleFailures[0].questionGroupIndex, 1);
        });

        it('a hidden child inside a non-repeatable group raises no error', () => {
            const groupConcept = concept("Lesion", Concept.dataType.QuestionGroup);
            const hidden = concept("AI Verdict", Concept.dataType.Text, hiddenKeyValues);
            const groupFe = EntityFactory.createFormElement("Lesion", false, groupConcept, 1);
            const hiddenChild = EntityFactory.createFormElement("AI Verdict", true, hidden, 1);
            hiddenChild.groupUuid = groupFe.uuid;
            const holder = new ObservationsHolder([Observation.create(groupConcept, new QuestionGroup([]))]);

            assert.isEmpty(groupWith(groupFe, hiddenChild).validate(holder, [groupFe, hiddenChild]));
        });

        it('a hidden question group skips all of its children', () => {
            const groupConcept = concept("Hidden Group", Concept.dataType.QuestionGroup, hiddenKeyValues);
            const visible = concept("Site", Concept.dataType.Text);
            const groupFe = EntityFactory.createFormElement("Hidden Group", false, groupConcept, 1);
            const child = EntityFactory.createFormElement("Site", true, visible, 1);
            child.groupUuid = groupFe.uuid;

            assert.isEmpty(groupWith(groupFe, child).validate(new ObservationsHolder([]), [groupFe, child]));
        });

        it('the hidden element is not removed from the list it was given', () => {
            const hidden = concept("AI Verdict", Concept.dataType.Text, hiddenKeyValues);
            const fe = EntityFactory.createFormElement("AI Verdict", true, hidden, 1);
            const filtered = [fe];
            groupWith(fe).validate(new ObservationsHolder([]), filtered);

            assert.lengthOf(filtered, 1, "validate must not mutate filteredFormElements; that list decides which observations survive");
        });
    });

  function createFormElement(uuid, answers = [], isVoided = false, parentGroupUuid = null) {
        let x = new FormElement();
        x.uuid = uuid;
        x.getRawAnswers = function () {
            return answers;
        }
        x.voided = isVoided;
        x.groupUuid = parentGroupUuid;
        return x;
    }
});
