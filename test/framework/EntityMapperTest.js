import {assert} from "chai";
import {Documentation, EntityMapper, Format} from "../../src";
import General from "../../src/utility/General";

describe('EntityMapperTest', () => {
  it('toValueObject', () => {
    const entityMapper = new EntityMapper();
    const realmObject = {regex: "foo", descriptionKey: "bar"};
    const valueObject = entityMapper.toValueObject(realmObject, Format);
    assert.equal(valueObject.regex, realmObject.regex);
  });

  it('toValueObjectCollection', function () {
    const entityMapper = new EntityMapper();
    const realmObject = {regex: "foo", descriptionKey: "bar"};
    const valueObjects = entityMapper.toValueObjectCollection([realmObject], Format);
    assert.equal(valueObjects.length, 1);
    assert.equal(valueObjects[0].regex, realmObject.regex);
  });

  it('toEntity', function () {
    const entityMapper = new EntityMapper();
    const documentationItemRO = {uuid: General.randomUUID(), name: "foo", voided: false};
    const documentationRO = {uuid: General.randomUUID(), content: "bar", voided: false, documentationItems: [documentationItemRO]};
    documentationItemRO.documentation = documentationRO;

    const entity = entityMapper.toEntity(documentationRO, Documentation);
    assert.equal(entity.uuid, documentationRO.uuid);
    assert.equal(entity.name, documentationRO.name);
    assert.equal(entity.documentationItems.length, 1);
    assert.equal(entity.documentationItems[0].uuid, documentationItemRO.uuid);
    assert.equal(entity.documentationItems[0].content, documentationItemRO.content);
  });
});
