import _ from "lodash";

class Calendars {
  // Walk the subject's address-level chain leaf -> root; return the first non-voided
  // calendar attached at any level. Falls back to the org's global default calendar
  // (addressLevelUUID == null). Returns null if neither resolves. Never throws.
  static forSubject(subject, calendars) {
    if (_.isNil(subject) || _.isEmpty(calendars)) return Calendars._globalDefault(calendars);
    const addressLevel = subject.lowestAddressLevel;
    if (_.isNil(addressLevel) || !_.isFunction(addressLevel.getLineage)) {
      return Calendars._globalDefault(calendars);
    }
    const lineage = addressLevel.getLineage();
    for (const level of lineage) {
      if (_.isNil(level)) continue;
      const match = _.find(
        calendars,
        (c) => c && !c.voided && c.addressLevelUUID === level.uuid
      );
      if (match) return match;
    }
    return Calendars._globalDefault(calendars);
  }

  static _globalDefault(calendars) {
    if (_.isEmpty(calendars)) return null;
    return (
      _.find(calendars, (c) => c && !c.voided && _.isNil(c.addressLevelUUID)) || null
    );
  }
}

export default Calendars;
