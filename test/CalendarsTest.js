import Calendars from "../src/location/Calendars";
import Calendar from "../src/Calendar";
import AddressLevel, {LocationMapping} from "../src/AddressLevel";
import Individual from "../src/Individual";
import General from "../src/utility/General";

function newAddressLevel({uuid, parent}) {
  const al = new AddressLevel();
  al.uuid = uuid || General.randomUUID();
  al.name = `Level-${al.uuid.slice(0, 4)}`;
  al.level = 1;
  al.voided = false;
  al.locationMappings = [];
  if (parent) {
    const mapping = new LocationMapping();
    mapping.uuid = General.randomUUID();
    mapping.parent = parent;
    mapping.child = al;
    mapping.voided = false;
    al.locationMappings.push(mapping);
  }
  return al;
}

function newCalendar({uuid, addressLevelUUID = null, voided = false}) {
  const cal = new Calendar();
  cal.uuid = uuid || General.randomUUID();
  cal.name = `Cal-${cal.uuid.slice(0, 4)}`;
  cal.workingPattern = JSON.stringify(Calendar.defaultWorkingPattern);
  cal.addressLevelUUID = addressLevelUUID;
  cal.isDefault = false;
  cal.voided = voided;
  return cal;
}

function newSubject(lowestAddressLevel) {
  const ind = new Individual();
  ind.uuid = General.randomUUID();
  ind.lowestAddressLevel = lowestAddressLevel;
  return ind;
}

describe("Calendars.forSubject", () => {
  it("returns the calendar attached to the most specific (leaf) address level", () => {
    const root = newAddressLevel({});
    const mid = newAddressLevel({parent: root});
    const leaf = newAddressLevel({parent: mid});
    const subject = newSubject(leaf);

    const rootCal = newCalendar({addressLevelUUID: root.uuid});
    const leafCal = newCalendar({addressLevelUUID: leaf.uuid});

    expect(Calendars.forSubject(subject, [rootCal, leafCal])).toBe(leafCal);
  });

  it("walks up the chain when leaf has no calendar", () => {
    const root = newAddressLevel({});
    const leaf = newAddressLevel({parent: root});
    const subject = newSubject(leaf);

    const rootCal = newCalendar({addressLevelUUID: root.uuid});

    expect(Calendars.forSubject(subject, [rootCal])).toBe(rootCal);
  });

  it("falls back to the global default (addressLevelUUID null)", () => {
    const root = newAddressLevel({});
    const subject = newSubject(root);

    const globalCal = newCalendar({addressLevelUUID: null});

    expect(Calendars.forSubject(subject, [globalCal])).toBe(globalCal);
  });

  it("returns null when nothing in the chain matches and no global default exists", () => {
    const root = newAddressLevel({});
    const subject = newSubject(root);

    const someOtherCal = newCalendar({addressLevelUUID: General.randomUUID()});

    expect(Calendars.forSubject(subject, [someOtherCal])).toBeNull();
  });

  it("skips voided calendars and continues the walk", () => {
    const root = newAddressLevel({});
    const leaf = newAddressLevel({parent: root});
    const subject = newSubject(leaf);

    const voidedLeafCal = newCalendar({addressLevelUUID: leaf.uuid, voided: true});
    const rootCal = newCalendar({addressLevelUUID: root.uuid});

    expect(Calendars.forSubject(subject, [voidedLeafCal, rootCal])).toBe(rootCal);
  });

  it("returns null on empty calendar list", () => {
    const root = newAddressLevel({});
    const subject = newSubject(root);
    expect(Calendars.forSubject(subject, [])).toBeNull();
  });

  it("returns null when subject has no address level", () => {
    const subject = newSubject(null);
    const globalCal = newCalendar({addressLevelUUID: null});
    expect(Calendars.forSubject(subject, [globalCal])).toBe(globalCal);
  });
});
