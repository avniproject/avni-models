import DefinedObjectSchema from "../src/framework/DefinedObjectSchema";
import {assert} from 'chai';

const schema = {
  name: "Foo",
  primaryKey: "uuid",
  properties: {
    uuid: "string",
    subjectType: "SubjectType",
    name: "string",
    age: "float",
    wage: "float?",
    middleName: {type: "string", optional: true},
    profilePicture: {type: "string", optional: false},
    dateOfBirth: {type: "date", optional: true},
    gender: {type: "Gender", optional: true},
    registrationDate: "date",
    lowestAddressLevel: {type: "AddressLevel", optional: false},
    enrolments: {type: "list", objectType: "Bar"},
    registrationLocation: {type: "Point", optional: true}
  }
};

it('should getNonOptionalObjectProperties', function () {
  const nonOptionalObjectProperties = DefinedObjectSchema.getNonOptionalObjectProperties(schema);
  assert.equal(nonOptionalObjectProperties.length, 2);
  assert.equal(nonOptionalObjectProperties[0], "subjectType");
  assert.equal(nonOptionalObjectProperties[1], "lowestAddressLevel");
});
