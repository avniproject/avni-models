import {AddressLevel} from "../../src";
import {LocationMapping} from "../../src/AddressLevel";

class AddressLevelFactory {
  static create({parent: parent, name: name}) {
    const addressLevel = new AddressLevel();
    addressLevel.name = name;
    const locationMapping = new LocationMapping();
    locationMapping.parent = parent;
    locationMapping.child = addressLevel;
    addressLevel.locationMappings = [locationMapping];
    return addressLevel;
  }
}

export default AddressLevelFactory;
