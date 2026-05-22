import AttendanceType from "../src/AttendanceType";
import General from "../src/utility/General";

function newAttendanceType(config) {
  const at = new AttendanceType();
  at.uuid = General.randomUUID();
  at.subjectTypeUUID = General.randomUUID();
  at.name = "Morning Prayer";
  at.sortOrder = 1;
  at.config = JSON.stringify(config || {});
  at.voided = false;
  return at;
}

describe("AttendanceType.config", () => {
  it("round-trips UUIDs, share rule (with quotes + newlines), and booleans", () => {
    const shareRule = "function shareTemplate(p) {\n  return 'Attendance: \"X\" present';\n}";
    const cfg = {
      sessionOutcomeReasonConcept: "concept-A",
      absenceReasonConcept: "concept-B",
      followUpEncounterType: "et-C",
      shareRule: shareRule,
      autoShareOnSave: true,
    };
    const at = newAttendanceType(cfg);
    expect(at.getSessionOutcomeReasonConceptUUID()).toBe("concept-A");
    expect(at.getAbsenceReasonConceptUUID()).toBe("concept-B");
    expect(at.getFollowUpEncounterTypeUUID()).toBe("et-C");
    expect(at.getShareRule()).toBe(shareRule);
    expect(at.isAutoShareOnSave()).toBe(true);
  });

  it("empty config makes all accessors return null/false", () => {
    const at = newAttendanceType({});
    expect(at.getSessionOutcomeReasonConceptUUID()).toBeNull();
    expect(at.getAbsenceReasonConceptUUID()).toBeNull();
    expect(at.getFollowUpEncounterTypeUUID()).toBeNull();
    expect(at.getShareRule()).toBeNull();
    expect(at.isAutoShareOnSave()).toBe(false);
  });

  it("setConfig then getConfig round-trips deep-equal", () => {
    const at = newAttendanceType({});
    const obj = {
      sessionOutcomeReasonConcept: "x",
      autoShareOnSave: false,
      shareRule: "noop",
    };
    at.setConfig(obj);
    expect(at.getConfig()).toEqual(obj);
  });

  it("isAutoShareOnSave coerces truthy values to boolean", () => {
    const at = newAttendanceType({autoShareOnSave: "yes"});
    expect(at.isAutoShareOnSave()).toBe(true);
  });

  it("fromResource accepts config as an object (not just string)", () => {
    const at = AttendanceType.fromResource({
      uuid: "at-1",
      subjectTypeUUID: "st-1",
      name: "Type",
      sortOrder: 2,
      config: {autoShareOnSave: true},
      voided: false,
    });
    expect(at.isAutoShareOnSave()).toBe(true);
    expect(at.sortOrder).toBe(2);
  });
});
