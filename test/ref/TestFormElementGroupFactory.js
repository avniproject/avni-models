import General from "../../src/utility/General";
import FormElementGroup from '../../src/application/FormElementGroup';

class TestFormElementGroupFactory {
    static create({uuid = General.randomUUID(), name = General.randomUUID(), formElements = [], displayOrder = 1, form}) {
        const entity = new FormElementGroup();
        entity.uuid = uuid;
        entity.name = name;
        entity.displayOrder = displayOrder;
        entity.formElements = formElements;
        form.addFormElementGroup(entity);
        return entity;
    }
}

export default TestFormElementGroupFactory;
