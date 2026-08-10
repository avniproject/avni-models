import {assert} from "chai";
import FormElement from "../../src/application/FormElement";
import FormElementStatus from "../../src/application/FormElementStatus";
import FormElementGroup from "../../src/application/FormElementGroup";

function formElementGroupWith(uuid) {
    const formElement = new FormElement();
    formElement.uuid = uuid;
    const formElementGroup = new FormElementGroup();
    formElementGroup.formElements = [formElement];
    return formElementGroup;
}

describe("applying a rule's FormElementStatus onto a FormElement", () => {
    it("carries answersToShow across", () => {
        const [filtered] = formElementGroupWith("fe-uuid")
            .filterElements([new FormElementStatus("fe-uuid", true, null, [], [], ["show-1"])]);
        assert.deepEqual([...filtered.answersToShow], ["show-1"]);
    });

    it("carries answersToSkip across as answersToExclude", () => {
        const [filtered] = formElementGroupWith("fe-uuid")
            .filterElements([new FormElementStatus("fe-uuid", true, null, ["skip-1"], [], [])]);
        assert.deepEqual([...filtered.answersToExclude], ["skip-1"]);
    });

    it("carries both across when a rule sets showAnswers and skipAnswers together", () => {
        const [filtered] = formElementGroupWith("fe-uuid")
            .filterElements([new FormElementStatus("fe-uuid", true, null, ["skip-1"], [], ["show-1", "skip-1"])]);
        assert.deepEqual([...filtered.answersToShow], ["show-1", "skip-1"]);
        assert.deepEqual([...filtered.answersToExclude], ["skip-1"]);
    });
});
