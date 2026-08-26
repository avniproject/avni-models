import {assert} from "chai";
import FormElement from "../../src/application/FormElement";
import FormElementStatus from "../../src/application/FormElementStatus";
import FormElementGroup from "../../src/application/FormElementGroup";
import KeyValue from "../../src/application/KeyValue";

function formElementGroupWith(uuid, keyValues = []) {
    const formElement = new FormElement();
    formElement.uuid = uuid;
    formElement.keyValues = keyValues.map(KeyValue.fromResource);
    const formElementGroup = new FormElementGroup();
    formElementGroup.formElements = [formElement];
    return formElementGroup;
}

function guidedCameraGroup(uuid, value = true) {
    return formElementGroupWith(uuid, [{key: "guidedCamera", value}]);
}

function statusWith(uuid, visibility, captureGuidance, questionGroupIndex) {
    const status = new FormElementStatus(uuid, visibility, null);
    if (captureGuidance !== undefined) status.addCaptureGuidance(captureGuidance);
    if (questionGroupIndex !== undefined) status.addQuestionGroupInformation(questionGroupIndex);
    return status;
}

const fullGuidance = {
    label: "3 of 14 — Left buccal mucosa",
    flash: "on",
    blockOnNoFlash: true,
    blockOnCaptureFailure: true,
    reckoner: "/models/aaa.bin",
    overlay: "/models/bbb.bin"
};

describe("captureGuidance carried onto the filtered FormElement", () => {
    it("arrives intact on the clone", () => {
        const [filtered] = formElementGroupWith("fe-uuid")
            .filterElements([statusWith("fe-uuid", true, fullGuidance)]);
        assert.deepEqual(filtered.captureGuidance, fullGuidance);
    });

    it("carries a partial object across, leaving absent fields undefined", () => {
        const [filtered] = formElementGroupWith("fe-uuid")
            .filterElements([statusWith("fe-uuid", true, {label: "Photo 3", flash: "auto"})]);
        assert.equal(filtered.captureGuidance.label, "Photo 3");
        assert.equal(filtered.captureGuidance.flash, "auto");
        assert.isUndefined(filtered.captureGuidance.blockOnNoFlash);
        assert.isUndefined(filtered.captureGuidance.reckoner);
    });

    it("leaves captureGuidance undefined when the rule set none", () => {
        const [filtered] = formElementGroupWith("fe-uuid")
            .filterElements([statusWith("fe-uuid", true)]);
        assert.isUndefined(filtered.captureGuidance);
    });

    it("keeps two rows of the same form element isolated", () => {
        const rowZero = {label: "row 0", reckoner: "/models/zero.bin"};
        const rowOne = {label: "row 1", reckoner: "/models/one.bin"};
        const filtered = formElementGroupWith("fe-uuid").filterElements([
            statusWith("fe-uuid", true, rowZero, 0),
            statusWith("fe-uuid", true, rowOne, 1)
        ]);
        assert.equal(filtered.length, 2);
        assert.deepEqual(filtered[0].captureGuidance, rowZero);
        assert.deepEqual(filtered[1].captureGuidance, rowOne);
        assert.equal(filtered[0].questionGroupIndex, 0);
        assert.equal(filtered[1].questionGroupIndex, 1);
    });
});

describe("captureGuidance through FormElementStatus.and/or", () => {
    it("or() preserves the receiver's captureGuidance", () => {
        const combined = statusWith("fe-uuid", true, fullGuidance).or(statusWith("fe-uuid", false));
        assert.deepEqual(combined.captureGuidance, fullGuidance);
        assert.isTrue(combined.visibility);
    });

    it("and() preserves the receiver's captureGuidance", () => {
        const combined = statusWith("fe-uuid", true, fullGuidance).and(statusWith("fe-uuid", true));
        assert.deepEqual(combined.captureGuidance, fullGuidance);
    });

    it("takes the receiver's guidance, not the argument's", () => {
        const combined = statusWith("fe-uuid", true, fullGuidance)
            .or(statusWith("fe-uuid", true, {label: "other"}));
        assert.equal(combined.captureGuidance.label, fullGuidance.label);
    });
});

describe("guided-camera backstop for a status with no usable visibility", () => {
    it("keeps a guided-camera element visible and blocked", () => {
        const [filtered] = guidedCameraGroup("fe-uuid")
            .filterElements([statusWith("fe-uuid", undefined, undefined)]);
        assert.isOk(filtered, "the guided-camera element must not be dropped");
        assert.deepEqual(filtered.captureGuidance.blockCapture, {reason: "misconfiguration"});
    });

    it("applies to a 'true' string keyValue too", () => {
        const [filtered] = guidedCameraGroup("fe-uuid", "true")
            .filterElements([statusWith("fe-uuid", undefined)]);
        assert.deepEqual(filtered.captureGuidance.blockCapture, {reason: "misconfiguration"});
    });

    it("preserves whatever else the rule had set alongside the block", () => {
        const [filtered] = guidedCameraGroup("fe-uuid")
            .filterElements([statusWith("fe-uuid", undefined, {label: "Photo 3", flash: "on"})]);
        assert.equal(filtered.captureGuidance.label, "Photo 3");
        assert.equal(filtered.captureGuidance.flash, "on");
        assert.deepEqual(filtered.captureGuidance.blockCapture, {reason: "misconfiguration"});
    });

    it("still drops a NON guided-camera element with no usable visibility", () => {
        const filtered = formElementGroupWith("fe-uuid")
            .filterElements([statusWith("fe-uuid", undefined)]);
        assert.deepEqual(filtered, []);
    });

    it("still drops an element whose guidedCamera keyValue is off", () => {
        const filtered = guidedCameraGroup("fe-uuid", false)
            .filterElements([statusWith("fe-uuid", undefined)]);
        assert.deepEqual(filtered, []);
    });

    it("still drops a guided-camera element the rule deliberately hid", () => {
        // `false` is how a rule hides a question that does not apply. Forcing it visible-and-blocked
        // would take that ability away and show the worker a photo row that should not be there.
        const filtered = guidedCameraGroup("fe-uuid")
            .filterElements([statusWith("fe-uuid", false)]);
        assert.deepEqual(filtered, []);
    });

    it("blocks a guided-camera element whose rule returned a null visibility", () => {
        // Nil either way means the rule never answered; the row must fail visible, not vanish.
        const [filtered] = guidedCameraGroup("fe-uuid")
            .filterElements([statusWith("fe-uuid", null)]);
        assert.deepEqual(filtered.captureGuidance.blockCapture, {reason: "misconfiguration"});
    });

    it("does not block a guided-camera element the rule made visible", () => {
        const [filtered] = guidedCameraGroup("fe-uuid")
            .filterElements([statusWith("fe-uuid", true, {label: "Photo 3"})]);
        assert.isUndefined(filtered.captureGuidance.blockCapture);
    });
});
