import _ from "lodash";
import RealmObjectSchema from "../../src/framework/RealmObjectSchema";
import {assert} from 'chai';

const schema = {
  "properties": {
    "backgroundColour": {
      "indexed": false,
      "mapTo": "backgroundColour",
      "name": "backgroundColour",
      "optional": true,
      "type": "string"
    },
    "display": {
      "indexed": false,
      "mapTo": "display",
      "name": "display",
      "optional": true,
      "type": "string"
    },
    "displayOrder": {
      "indexed": false,
      "mapTo": "displayOrder",
      "name": "displayOrder",
      "optional": false,
      "type": "double"
    },
    "form": {
      "indexed": false,
      "mapTo": "form",
      "name": "form",
      "objectType": "Form",
      "optional": true,
      "type": "object"
    },
    "formElements": {
      "indexed": false,
      "mapTo": "formElements",
      "name": "formElements",
      "objectType": "FormElement",
      "optional": false,
      "type": "list"
    },
    "name": {
      "indexed": false,
      "mapTo": "name",
      "name": "name",
      "optional": false,
      "type": "string"
    },
    "rule": {
      "indexed": false,
      "mapTo": "rule",
      "name": "rule",
      "optional": true,
      "type": "string"
    },
    "startTime": {
      "indexed": false,
      "mapTo": "startTime",
      "name": "startTime",
      "optional": true,
      "type": "int"
    },
    "stayTime": {
      "indexed": false,
      "mapTo": "stayTime",
      "name": "stayTime",
      "optional": true,
      "type": "int"
    },
    "textColour": {
      "indexed": false,
      "mapTo": "textColour",
      "name": "textColour",
      "optional": true,
      "type": "string"
    },
    "timed": {
      "indexed": false,
      "mapTo": "timed",
      "name": "timed",
      "optional": false,
      "type": "bool"
    },
    "uuid": {
      "indexed": true,
      "mapTo": "uuid",
      "name": "uuid",
      "optional": false,
      "type": "string"
    },
    "voided": {
      "indexed": false,
      "mapTo": "voided",
      "name": "voided",
      "optional": false,
      "type": "bool"
    }
  }
};

describe('RealmObjectSchema', () => {
  it('should get properties', function () {
    const realmObjectSchema = new RealmObjectSchema(schema);
    assert.equal(realmObjectSchema.getPrimitiveProperties().length, 11);
    assert.equal(realmObjectSchema.getListProperties().length, 1);
    assert.equal(realmObjectSchema.getListProperties()[0], "formElements");
    assert.equal(realmObjectSchema.getObjectProperties()[0], "form");
    assert.equal(realmObjectSchema.getAllProperties().length, 13);
  });
});
