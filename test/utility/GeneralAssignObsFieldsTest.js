import {assert} from "chai";
import General from "../../src/utility/General";
import Concept from "../../src/Concept";
import TestConceptFactory from "../ref/TestConceptFactory";

// avniproject/avni-client#2250: one answer the app cannot read must not stop the whole sync.
describe("General.assignObsFields", () => {
    const durationConcept = TestConceptFactory.create({uuid: "duration-uuid", dataType: Concept.dataType.Duration});
    const textConcept = TestConceptFactory.create({uuid: "text-uuid", dataType: Concept.dataType.Text});
    const groupConcept = TestConceptFactory.create({uuid: "group-uuid", dataType: Concept.dataType.QuestionGroup});
    const phoneConcept = TestConceptFactory.create({uuid: "phone-uuid", dataType: Concept.dataType.PhoneNumber});
    // Fails the way a reader might, with the answer in the error text.
    const failingConcept = {
        uuid: "failing-uuid",
        datatype: "Text",
        isQuestionGroup: () => false,
        getValueWrapperFor: (value) => {
            throw new Error(`cannot read ${value}`);
        },
    };
    const concepts = {
        [durationConcept.uuid]: durationConcept,
        [textConcept.uuid]: textConcept,
        [groupConcept.uuid]: groupConcept,
        [phoneConcept.uuid]: phoneConcept,
        [failingConcept.uuid]: failingConcept,
    };
    const entityService = {findByKey: (key, uuid) => concepts[uuid]};

    const build = (observations) =>
        General.assignObsFields({uuid: "visit-uuid", observations}, {}, ["observations"], entityService).observations;
    const conceptUuids = (observations) => observations.map((observation) => observation.concept.uuid);

    let logError;
    beforeEach(() => {
        logError = jest.spyOn(General, "logError").mockImplementation(() => {});
    });
    afterEach(() => {
        logError.mockRestore();
    });

    it("keeps a duration answer in the form the app writes", () => {
        const observations = build({"duration-uuid": "PT35M", "text-uuid": "attended"});

        assert.deepEqual(conceptUuids(observations), ["duration-uuid", "text-uuid"]);
        assert.equal(observations[0].getValueWrapper().toResource, "PT35M");
        assert.equal(logError.mock.calls.length, 0);
    });

    it("leaves out a duration answer saved as a plain number in text, and keeps the other answers", () => {
        const observations = build({"duration-uuid": "35", "text-uuid": "attended"});

        assert.deepEqual(conceptUuids(observations), ["text-uuid"]);
        assert.equal(observations[0].getValueWrapper().getValue(), "attended");
    });

    it("leaves out a duration answer saved as a number", () => {
        const observations = build({"duration-uuid": 35, "text-uuid": "attended"});

        assert.deepEqual(conceptUuids(observations), ["text-uuid"]);
    });

    it("leaves out an unreadable answer inside a question group, and keeps the rest of the group", () => {
        const observations = build({"group-uuid": {"duration-uuid": "35", "text-uuid": "attended"}});

        assert.deepEqual(conceptUuids(observations), ["group-uuid"]);
        const groupObservations = observations[0].getValueWrapper().getValue();
        assert.deepEqual(conceptUuids(groupObservations), ["text-uuid"]);
    });

    it("leaves out an unreadable answer inside a repeatable question group, and keeps the rest of each row", () => {
        const observations = build({
            "group-uuid": [
                {"duration-uuid": "35", "text-uuid": "first"},
                {"duration-uuid": "PT10M", "text-uuid": "second"},
            ],
        });

        const rows = observations[0].getValueWrapper().getValue();
        assert.deepEqual(conceptUuids(rows[0].getValue()), ["text-uuid"]);
        assert.deepEqual(conceptUuids(rows[1].getValue()), ["duration-uuid", "text-uuid"]);
    });

    it("reports the question and the record it left an answer out of, and never the answer", () => {
        build({"duration-uuid": "35"});

        assert.equal(logError.mock.calls.length, 1);
        const message = logError.mock.calls[0][1];
        assert.include(message, "duration-uuid");
        assert.include(message, "visit-uuid");
        assert.include(message, "Duration");
        assert.notInclude(message, "35");
    });

    it("keeps the answer out of the log even when the error text carries it", () => {
        build({"failing-uuid": "Sunita Devi"});

        assert.equal(logError.mock.calls.length, 1);
        assert.notInclude(logError.mock.calls[0][1], "Sunita");
    });

    it("says so when the record has no uuid to report", () => {
        General.assignObsFields({locationProperties: {"duration-uuid": "35"}}, {}, ["locationProperties"], entityService);

        assert.include(logError.mock.calls[0][1], "a record without a uuid");
        assert.notInclude(logError.mock.calls[0][1], "undefined");
    });

    it("leaves alone an answer the reader returns nothing for, which is not a failure to read", () => {
        const observations = build({"phone-uuid": "9999999999", "text-uuid": "attended"});

        assert.deepEqual(conceptUuids(observations), ["phone-uuid", "text-uuid"]);
        assert.equal(logError.mock.calls.length, 0);
    });

    it("still fails when the question itself is not on the device, and does not report it as an unreadable answer", () => {
        assert.throws(() => build({"unknown-uuid": "attended"}), TypeError);
        assert.equal(logError.mock.calls.length, 0);
    });

    it("still fails when a question inside a question group is not on the device", () => {
        assert.throws(() => build({"group-uuid": {"unknown-uuid": "attended"}}), /not on the device/);
        assert.equal(logError.mock.calls.length, 0);
    });
});
