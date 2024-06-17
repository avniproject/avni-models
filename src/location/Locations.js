import _ from "lodash";

// AddressLevel = Location
class Locations {
    static getUniqueLevels(locations) {
        return _.uniq(locations.map((x) => x.level));
    }
}

export default Locations;
