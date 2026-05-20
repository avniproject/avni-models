import Session from "../src/Session";
import AttendanceRecord from "../src/AttendanceRecord";
import AttendanceType from "../src/AttendanceType";
import Individual from "../src/Individual";
import Encounter from "../src/Encounter";
import ProgramEncounter from "../src/ProgramEncounter";
import EncounterType from "../src/EncounterType";
import ProgramEnrolment from "../src/ProgramEnrolment";
import General from "../src/utility/General";
import moment from "moment";
import _ from "lodash";

function newSession() {
  const s = new Session();
  s.uuid = General.randomUUID();
  s.groupSubjectUUID = General.randomUUID();
  s.scheduledDate = "2026-05-15";
  s.attendanceTypeUUID = General.randomUUID();
  s.voided = false;
  return s;
}

function newAttendanceType(config = {}) {
  const at = new AttendanceType();
  at.uuid = General.randomUUID();
  at.subjectTypeUUID = General.randomUUID();
  at.name = "Test Type";
  at.sortOrder = 1;
  at.config = JSON.stringify(config);
  at.voided = false;
  return at;
}

function newStudent(uuid) {
  const ind = new Individual();
  ind.uuid = uuid || General.randomUUID();
  return ind;
}

function newEncounterType(uuid) {
  const et = new EncounterType();
  et.uuid = uuid || General.randomUUID();
  et.name = "Home Visit";
  return et;
}

function newRecord({subjectUUID, status, reasonConceptUUID = null, followUpEncounterUUID = null}) {
  const r = new AttendanceRecord();
  r.uuid = General.randomUUID();
  r.sessionUUID = "session-1";
  r.subjectUUID = subjectUUID;
  r.status = status;
  r.reasonConceptUUID = reasonConceptUUID;
  r.followUpEncounterUUID = followUpEncounterUUID;
  r.voided = false;
  return r;
}

describe("Session", () => {
  describe("markHeld", () => {
    it("sets status, markedAt, and builds AttendanceRecords from the roster", () => {
      const session = newSession();
      const studentA = General.randomUUID();
      const studentB = General.randomUUID();
      const records = session.markHeld({
        [studentA]: {status: "Present"},
        [studentB]: {status: "Absent", reasonConceptUUID: "concept-sick"},
      });

      expect(session.status).toBe(Session.status.HELD);
      expect(session.markedAt).toBeInstanceOf(Date);
      expect(records).toHaveLength(2);
      const byStudent = _.keyBy(records, "subjectUUID");
      expect(byStudent[studentA].status).toBe("Present");
      expect(byStudent[studentB].status).toBe("Absent");
      expect(byStudent[studentB].reasonConceptUUID).toBe("concept-sick");
      expect(byStudent[studentA].reasonConceptUUID).toBeNull();
      records.forEach((r) => expect(r.sessionUUID).toBe(session.uuid));
    });
  });

  describe("markDidntHappen", () => {
    it("requires a reason concept", () => {
      const session = newSession();
      expect(() => session.markDidntHappen(null, "no reason")).toThrow(/reason concept/);
      expect(() => session.markDidntHappen({}, null)).toThrow(/reason concept/);
    });

    it("sets status, reasonConceptUUID, notes, and markedAt", () => {
      const session = newSession();
      session.markDidntHappen({uuid: "reason-uuid"}, "Power cut");
      expect(session.status).toBe(Session.status.DIDNT_HAPPEN);
      expect(session.reasonConceptUUID).toBe("reason-uuid");
      expect(session.notes).toBe("Power cut");
      expect(session.markedAt).toBeInstanceOf(Date);
    });
  });

  describe("autoCreateFollowUps", () => {
    const encounterTypeUUID = "et-followup";
    const encounterType = newEncounterType(encounterTypeUUID);

    it("returns empty when attendance type has no follow-up encounter type configured", () => {
      const session = newSession();
      const at = newAttendanceType({});
      const studentUUID = General.randomUUID();
      const records = [newRecord({subjectUUID: studentUUID, status: "Absent"})];
      const created = session.autoCreateFollowUps({
        attendanceRecords: records,
        attendanceType: at,
        encounterType,
        studentLookup: () => newStudent(studentUUID),
      });
      expect(created).toEqual([]);
      expect(records[0].followUpEncounterUUID).toBeNull();
    });

    it("only fires for Absent records with no reason", () => {
      const session = newSession();
      const at = newAttendanceType({follow_up_encounter_type_uuid: encounterTypeUUID});
      const presentStudent = General.randomUUID();
      const absentWithReason = General.randomUUID();
      const absentNoReason = General.randomUUID();
      const records = [
        newRecord({subjectUUID: presentStudent, status: "Present"}),
        newRecord({subjectUUID: absentWithReason, status: "Absent", reasonConceptUUID: "sick"}),
        newRecord({subjectUUID: absentNoReason, status: "Absent"}),
      ];
      const lookup = (uuid) => newStudent(uuid);
      const created = session.autoCreateFollowUps({
        attendanceRecords: records,
        attendanceType: at,
        encounterType,
        studentLookup: lookup,
      });
      expect(created).toHaveLength(1);
      expect(created[0]).toBeInstanceOf(Encounter);
      const triggered = _.find(records, (r) => r.subjectUUID === absentNoReason);
      expect(triggered.followUpEncounterUUID).toBe(created[0].uuid);
      // the other two records remain unlinked
      expect(records[0].followUpEncounterUUID).toBeNull();
      expect(records[1].followUpEncounterUUID).toBeNull();
    });

    it("non-program path produces general Encounter with the student as individual", () => {
      const session = newSession();
      const at = newAttendanceType({follow_up_encounter_type_uuid: encounterTypeUUID});
      const studentUUID = General.randomUUID();
      const student = newStudent(studentUUID);
      const records = [newRecord({subjectUUID: studentUUID, status: "Absent"})];
      const created = session.autoCreateFollowUps({
        attendanceRecords: records,
        attendanceType: at,
        encounterType,
        studentLookup: (uuid) => (uuid === studentUUID ? student : null),
      });
      expect(created).toHaveLength(1);
      const enc = created[0];
      expect(enc).toBeInstanceOf(Encounter);
      expect(enc.individual.uuid).toBe(student.uuid);
      expect(enc.encounterType.uuid).toBe(encounterType.uuid);
      const startOfToday = moment().startOf("day").toDate().getTime();
      expect(enc.earliestVisitDateTime.getTime()).toBe(startOfToday);
      const expectedMax = moment().startOf("day").add(2, "days").toDate().getTime();
      expect(enc.maxVisitDateTime.getTime()).toBe(expectedMax);
    });

    it("program path produces ProgramEncounter using resolved enrolment", () => {
      const session = newSession();
      const at = newAttendanceType({follow_up_encounter_type_uuid: encounterTypeUUID});
      const studentUUID = General.randomUUID();
      const student = newStudent(studentUUID);
      const enrolment = new ProgramEnrolment();
      enrolment.uuid = General.randomUUID();
      const records = [newRecord({subjectUUID: studentUUID, status: "Absent"})];
      const created = session.autoCreateFollowUps({
        attendanceRecords: records,
        attendanceType: at,
        encounterType,
        programUUID: "program-1",
        studentLookup: () => student,
        enrolmentLookup: (s, programUUID) => (s === student && programUUID === "program-1" ? enrolment : null),
      });
      expect(created).toHaveLength(1);
      expect(created[0]).toBeInstanceOf(ProgramEncounter);
      expect(created[0].programEnrolment.uuid).toBe(enrolment.uuid);
    });

    it("program path skips students with no resolvable enrolment", () => {
      const session = newSession();
      const at = newAttendanceType({follow_up_encounter_type_uuid: encounterTypeUUID});
      const studentUUID = General.randomUUID();
      const records = [newRecord({subjectUUID: studentUUID, status: "Absent"})];
      const created = session.autoCreateFollowUps({
        attendanceRecords: records,
        attendanceType: at,
        encounterType,
        programUUID: "program-1",
        studentLookup: (uuid) => newStudent(uuid),
        enrolmentLookup: () => null,
      });
      expect(created).toHaveLength(0);
      expect(records[0].followUpEncounterUUID).toBeNull();
    });

    it("creates distinct UUIDs when called for two sessions on the same student/day", () => {
      const session1 = newSession();
      const session2 = newSession();
      const at = newAttendanceType({follow_up_encounter_type_uuid: encounterTypeUUID});
      const studentUUID = General.randomUUID();
      const r1 = [newRecord({subjectUUID: studentUUID, status: "Absent"})];
      const r2 = [newRecord({subjectUUID: studentUUID, status: "Absent"})];
      const opts = {
        attendanceType: at,
        encounterType,
        studentLookup: (uuid) => newStudent(uuid),
      };
      const created1 = session1.autoCreateFollowUps({...opts, attendanceRecords: r1});
      const created2 = session2.autoCreateFollowUps({...opts, attendanceRecords: r2});
      expect(created1[0].uuid).not.toBe(created2[0].uuid);
      expect(r1[0].followUpEncounterUUID).toBe(created1[0].uuid);
      expect(r2[0].followUpEncounterUUID).toBe(created2[0].uuid);
    });
  });

  describe("voidStaleFollowUps", () => {
    function newScheduledEncounter(uuid) {
      const e = new Encounter();
      e.uuid = uuid;
      e.observations = [];
      e.cancelObservations = [];
      e.voided = false;
      return e;
    }

    function newStartedEncounter(uuid) {
      const e = newScheduledEncounter(uuid);
      e.encounterDateTime = new Date();
      return e;
    }

    function newEncounterWithObservations(uuid) {
      const e = newScheduledEncounter(uuid);
      e.observations = [{some: "obs"}];
      return e;
    }

    it("voids scheduled encounters when the absence no longer needs follow-up", () => {
      const session = newSession();
      const studentUUID = General.randomUUID();
      const encounterUUID = General.randomUUID();
      const prev = [newRecord({subjectUUID: studentUUID, status: "Absent", followUpEncounterUUID: encounterUUID})];
      // student is now Present
      const next = [newRecord({subjectUUID: studentUUID, status: "Present"})];
      const encounter = newScheduledEncounter(encounterUUID);
      const lookup = (uuid) => (uuid === encounterUUID ? encounter : null);

      const result = session.voidStaleFollowUps(prev, next, lookup);
      expect(result.voided).toHaveLength(1);
      expect(result.voided[0]).toBe(encounter);
      expect(encounter.voided).toBe(true);
      expect(result.skipped).toHaveLength(0);
    });

    it("voids when the student is now Absent-with-reason", () => {
      const session = newSession();
      const studentUUID = General.randomUUID();
      const encounterUUID = General.randomUUID();
      const prev = [newRecord({subjectUUID: studentUUID, status: "Absent", followUpEncounterUUID: encounterUUID})];
      const next = [newRecord({subjectUUID: studentUUID, status: "Absent", reasonConceptUUID: "now-known"})];
      const encounter = newScheduledEncounter(encounterUUID);
      const lookup = (uuid) => (uuid === encounterUUID ? encounter : null);

      const result = session.voidStaleFollowUps(prev, next, lookup);
      expect(result.voided).toHaveLength(1);
      expect(encounter.voided).toBe(true);
    });

    it("skips encounters that already have observations", () => {
      const session = newSession();
      const studentUUID = General.randomUUID();
      const encounterUUID = General.randomUUID();
      const prev = [newRecord({subjectUUID: studentUUID, status: "Absent", followUpEncounterUUID: encounterUUID})];
      const next = [newRecord({subjectUUID: studentUUID, status: "Present"})];
      const encounter = newEncounterWithObservations(encounterUUID);
      const lookup = (uuid) => (uuid === encounterUUID ? encounter : null);

      const result = session.voidStaleFollowUps(prev, next, lookup);
      expect(result.voided).toHaveLength(0);
      expect(result.skipped).toHaveLength(1);
      expect(encounter.voided).toBe(false);
    });

    it("skips encounters that have been started (encounterDateTime set)", () => {
      const session = newSession();
      const studentUUID = General.randomUUID();
      const encounterUUID = General.randomUUID();
      const prev = [newRecord({subjectUUID: studentUUID, status: "Absent", followUpEncounterUUID: encounterUUID})];
      const next = [newRecord({subjectUUID: studentUUID, status: "Present"})];
      const encounter = newStartedEncounter(encounterUUID);
      const lookup = (uuid) => (uuid === encounterUUID ? encounter : null);

      const result = session.voidStaleFollowUps(prev, next, lookup);
      expect(result.voided).toHaveLength(0);
      expect(result.skipped).toHaveLength(1);
    });

    it("leaves a still-warranted follow-up alone (Absent + no reason in both states)", () => {
      const session = newSession();
      const studentUUID = General.randomUUID();
      const encounterUUID = General.randomUUID();
      const prev = [newRecord({subjectUUID: studentUUID, status: "Absent", followUpEncounterUUID: encounterUUID})];
      const next = [newRecord({subjectUUID: studentUUID, status: "Absent"})];
      const encounter = newScheduledEncounter(encounterUUID);
      const lookup = (uuid) => (uuid === encounterUUID ? encounter : null);

      const result = session.voidStaleFollowUps(prev, next, lookup);
      expect(result.voided).toHaveLength(0);
      expect(result.skipped).toHaveLength(0);
      expect(encounter.voided).toBe(false);
    });
  });

  describe("re-mark scenarios (caller-responsibility contract)", () => {
    it("markDidntHappen after markHeld replaces status + reasonConceptUUID + notes", () => {
      const session = newSession();
      const created = session.markHeld({s1: {status: "Present"}});
      expect(session.status).toBe(Session.status.HELD);
      expect(created).toHaveLength(1);
      // The caller would void/discard the previously-built records before persisting
      // the DidntHappen update — verifying just the session-level field flip here.
      session.markDidntHappen({uuid: "reason-uuid"}, "Power cut");
      expect(session.status).toBe(Session.status.DIDNT_HAPPEN);
      expect(session.reasonConceptUUID).toBe("reason-uuid");
      expect(session.notes).toBe("Power cut");
    });

    it("markHeld after markDidntHappen clears reasonConceptUUID back to null", () => {
      const session = newSession();
      session.markDidntHappen({uuid: "reason-uuid"}, "Power cut");
      const records = session.markHeld({s1: {status: "Absent", reasonConceptUUID: "sick"}});
      expect(session.status).toBe(Session.status.HELD);
      expect(session.reasonConceptUUID).toBeNull();
      expect(records).toHaveLength(1);
    });
  });

  describe("fromResource / toResource", () => {
    it("stores scheduledDate as a plain YYYY-MM-DD string and round-trips it", () => {
      const session = Session.fromResource({
        uuid: "sess-1",
        groupSubjectUUID: "group-1",
        scheduledDate: "2026-05-09",
        attendanceTypeUUID: "at-1",
        status: "Held",
        markedByUserName: "alice",
        markedAt: "2026-05-09T08:15:00Z",
        voided: false,
      });
      expect(session.scheduledDate).toBe("2026-05-09");
      expect(typeof session.scheduledDate).toBe("string");
      expect(session.toResource.scheduledDate).toBe("2026-05-09");
    });

    it("preserves markedAt as a timestamp (round-tripped via toResource)", () => {
      const session = Session.fromResource({
        uuid: "sess-2",
        groupSubjectUUID: "group-1",
        scheduledDate: "2026-05-09",
        attendanceTypeUUID: "at-1",
        status: "Held",
        markedAt: "2026-05-09T08:15:00Z",
      });
      expect(session.markedAt instanceof Date).toBe(true);
      expect(session.markedAt.toISOString()).toBe("2026-05-09T08:15:00.000Z");
      expect(session.toResource.markedAt).toBeTruthy();
    });

    it("handles a DidntHappen session with reasonConceptUUID + notes", () => {
      const session = Session.fromResource({
        uuid: "sess-3",
        groupSubjectUUID: "group-1",
        scheduledDate: "2026-05-09",
        attendanceTypeUUID: "at-1",
        status: "DidntHappen",
        reasonConceptUUID: "reason-1",
        notes: "Teacher absent",
        markedAt: "2026-05-09T08:15:00Z",
      });
      expect(session.toResource).toEqual(
        expect.objectContaining({
          uuid: "sess-3",
          status: "DidntHappen",
          reasonConceptUUID: "reason-1",
          notes: "Teacher absent",
          scheduledDate: "2026-05-09",
        })
      );
    });

    it("nulls out optional fields when omitted", () => {
      const session = Session.fromResource({
        uuid: "sess-4",
        groupSubjectUUID: "group-1",
        scheduledDate: "2026-05-09",
        attendanceTypeUUID: "at-1",
        status: "Held",
      });
      expect(session.reasonConceptUUID).toBeNull();
      expect(session.notes).toBeNull();
      expect(session.markedAt).toBeNull();
    });

    it("populates audit fields from the _links envelope", () => {
      const session = Session.fromResource({
        uuid: "sess-5",
        groupSubjectUUID: "group-1",
        scheduledDate: "2026-05-09",
        attendanceTypeUUID: "at-1",
        status: "Held",
        _links: {
          createdBy: {href: "alice"},
          createdByUUID: {href: "u-alice"},
          lastModifiedBy: {href: "bob"},
          lastModifiedByUUID: {href: "u-bob"},
        },
      });
      expect(session.createdBy).toBe("alice");
      expect(session.lastModifiedByUUID).toBe("u-bob");
    });
  });
});
