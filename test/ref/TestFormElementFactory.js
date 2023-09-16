import General from "../../src/utility/General";
import {FormElement, FormElementGroup} from "../../src";

class TestFormElementFactory {
    static create({uuid = General.randomUUID(), name = General.randomUUID(), displayOrder, concept, formElementGroup = new FormElementGroup(), mandatory = true, keyValues = []}) {
        const entity = new FormElement();
        entity.uuid = uuid;
        entity.name = name;
        entity.concept = concept;
        entity.displayOrder = displayOrder;
        entity.formElementGroup = formElementGroup;
        entity.mandatory = mandatory;
        entity.keyValues = keyValues;
        formElementGroup.formElements = [entity];
        return entity;
    }
}

export default TestFormElementFactory;
