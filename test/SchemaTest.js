import {assert} from "chai";
import {createTransactionDataMapForEmbeddedFields} from "../src/Schema";

it('should createTransactionDataMapForEmbeddedFields', function () {
    const map = createTransactionDataMapForEmbeddedFields();
    assert.equal(map.get("Encounter").length, 4);
});
