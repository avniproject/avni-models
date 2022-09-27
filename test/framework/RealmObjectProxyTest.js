import {assert} from 'chai';
import _ from "lodash";
import {AddressLevel, Individual} from "../../src";

describe('RealmObjectProxyTest', () => {
  it('set object', () => {
    let addressLevel = new AddressLevel();
    addressLevel.uuid = "uuid-1";

    let individual = Individual.createEmptyInstance();
    individual.lowestAddressLevel = addressLevel;
    assert.equal(individual.lowestAddressLevel.uuid, "uuid-1");

    individual.lowestAddressLevel = {uuid: "uuid-1"};
    assert.equal(individual.lowestAddressLevel.uuid, "uuid-1");
  });
});
