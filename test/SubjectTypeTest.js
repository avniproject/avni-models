import SubjectType from "../src/SubjectType";
import AttendanceType from "../src/AttendanceType";
import General from "../src/utility/General";

function newSubjectType(uuid) {
  const st = new SubjectType();
  st.uuid = uuid || General.randomUUID();
  st.name = "Class";
  st.group = true;
  st.attendanceEnabled = true;
  return st;
}

function newAttendanceType({subjectTypeUUID, sortOrder = 0, voided = false, name = "T"}) {
  const at = new AttendanceType();
  at.uuid = General.randomUUID();
  at.subjectTypeUUID = subjectTypeUUID;
  at.name = name;
  at.sortOrder = sortOrder;
  at.config = "{}";
  at.voided = voided;
  return at;
}

describe("SubjectType.getAttendanceTypes", () => {
  it("returns only non-voided types for this subject type, ordered by sortOrder", () => {
    const st = newSubjectType();
    const other = newSubjectType();
    const tA = newAttendanceType({subjectTypeUUID: st.uuid, sortOrder: 2, name: "Math"});
    const tB = newAttendanceType({subjectTypeUUID: st.uuid, sortOrder: 1, name: "Prayer"});
    const tC = newAttendanceType({subjectTypeUUID: st.uuid, sortOrder: 3, name: "Reading", voided: true});
    const tD = newAttendanceType({subjectTypeUUID: other.uuid, sortOrder: 1, name: "Foreign"});

    const result = st.getAttendanceTypes([tA, tB, tC, tD]);
    expect(result.map((t) => t.name)).toEqual(["Prayer", "Math"]);
  });

  it("returns empty list when nothing matches", () => {
    const st = newSubjectType();
    expect(st.getAttendanceTypes([])).toEqual([]);
    expect(st.getAttendanceTypes(null)).toEqual([]);
  });
});

describe("SubjectType.attendanceEnabled", () => {
  it("defaults to false from fromResource when payload omits the field", () => {
    const st = SubjectType.fromResource({
      subjectTypeUUID: General.randomUUID(),
      name: "X",
      group: false,
      household: false,
      active: true,
      type: "Person",
    });
    expect(st.attendanceEnabled).toBe(false);
  });

  it("reads true from fromResource when payload includes it", () => {
    const st = SubjectType.fromResource({
      subjectTypeUUID: General.randomUUID(),
      name: "Class",
      group: true,
      household: false,
      active: true,
      type: "Group",
      attendanceEnabled: true,
    });
    expect(st.attendanceEnabled).toBe(true);
  });
});
