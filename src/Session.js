import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import SchemaNames from "./SchemaNames";
import {AuditFields, mapAuditFields} from "./utility/AuditUtil";
import DateTimeUtil from "./utility/DateTimeUtil";
import AttendanceRecord from "./AttendanceRecord";
import Encounter from "./Encounter";
import ProgramEncounter from "./ProgramEncounter";
import moment from "moment";
import _ from "lodash";

class Session extends BaseEntity {
  static schema = {
    name: SchemaNames.Session,
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      groupSubjectUUID: "string",
      // scheduledDate is a Postgres `date` (no time, no zone); stored as
      // "YYYY-MM-DD" so the client carries zero TZ semantics at rest.
      scheduledDate: "string",
      attendanceTypeUUID: "string",
      status: "string",
      reasonConceptUUID: {type: "string", optional: true},
      notes: {type: "string", optional: true},
      markedByUserName: {type: "string", optional: true},
      // markedAt is a true timestamp (when the user saved) — Realm `date` is fine.
      markedAt: {type: "date", optional: true},
      voided: {type: "bool", default: false},
      ...AuditFields,
    },
  };

  static status = {
    HELD: "Held",
    DIDNT_HAPPEN: "DidntHappen",
  };

  constructor(that = null) {
    super(that);
  }

  get groupSubjectUUID() {
    return this.that.groupSubjectUUID;
  }

  set groupSubjectUUID(x) {
    this.that.groupSubjectUUID = x;
  }

  get scheduledDate() {
    return this.that.scheduledDate;
  }

  // Accepts a "YYYY-MM-DD" string or a JS Date; normalizes to a canonical string.
  set scheduledDate(x) {
    this.that.scheduledDate = DateTimeUtil.toCalendarDateString(x);
  }

  get attendanceTypeUUID() {
    return this.that.attendanceTypeUUID;
  }

  set attendanceTypeUUID(x) {
    this.that.attendanceTypeUUID = x;
  }

  get status() {
    return this.that.status;
  }

  set status(x) {
    this.that.status = x;
  }

  get reasonConceptUUID() {
    return this.that.reasonConceptUUID;
  }

  set reasonConceptUUID(x) {
    this.that.reasonConceptUUID = x;
  }

  get notes() {
    return this.that.notes;
  }

  set notes(x) {
    this.that.notes = x;
  }

  get markedByUserName() {
    return this.that.markedByUserName;
  }

  set markedByUserName(x) {
    this.that.markedByUserName = x;
  }

  get markedAt() {
    return this.that.markedAt;
  }

  set markedAt(x) {
    this.that.markedAt = x;
  }

  get createdBy() {
    return this.that.createdBy;
  }

  set createdBy(x) {
    this.that.createdBy = x;
  }

  get lastModifiedBy() {
    return this.that.lastModifiedBy;
  }

  set lastModifiedBy(x) {
    this.that.lastModifiedBy = x;
  }

  get createdByUUID() {
    return this.that.createdByUUID;
  }

  set createdByUUID(x) {
    this.that.createdByUUID = x;
  }

  get lastModifiedByUUID() {
    return this.that.lastModifiedByUUID;
  }

  set lastModifiedByUUID(x) {
    this.that.lastModifiedByUUID = x;
  }

  isHeld() {
    return this.status === Session.status.HELD;
  }

  isDidntHappen() {
    return this.status === Session.status.DIDNT_HAPPEN;
  }

  // Caller iterates the returned records and persists them in the same realm.write.
  // rosterByStudentUUID: { [studentUUID]: { status: 'Present'|'Absent', reasonConceptUUID?: string } }
  // reasonConceptUUID: optional session-level reason. Required by the server for
  // Mark-Anyway-Held (Held on weekly_off/public_holiday); ignored on a working day.
  // Default null preserves prior semantics (e.g. re-mark-Held after DidntHappen
  // clears the previously-stored reason).
  markHeld(rosterByStudentUUID, reasonConceptUUID = null) {
    this.status = Session.status.HELD;
    this.reasonConceptUUID = reasonConceptUUID || null;
    this.markedAt = new Date();
    const records = [];
    _.forOwn(rosterByStudentUUID || {}, (entry, studentUUID) => {
      const record = new AttendanceRecord();
      record.uuid = General.randomUUID();
      record.sessionUUID = this.uuid;
      record.subjectUUID = studentUUID;
      record.status = entry.status;
      record.reasonConceptUUID = entry.reasonConceptUUID || null;
      record.followUpEncounterUUID = null;
      record.voided = false;
      records.push(record);
    });
    return records;
  }

  markDidntHappen(reasonConcept, notes) {
    if (_.isNil(reasonConcept) || _.isNil(reasonConcept.uuid)) {
      throw new Error("Session.markDidntHappen requires a reason concept");
    }
    this.status = Session.status.DIDNT_HAPPEN;
    this.reasonConceptUUID = reasonConcept.uuid;
    this.notes = notes || null;
    this.markedAt = new Date();
  }

  // Returns a list of newly built Encounter or ProgramEncounter instances; mutates
  // each triggering record's followUpEncounterUUID. Caller persists in same realm.write.
  //
  // Options:
  //   attendanceRecords  — the AttendanceRecords created for this session
  //   attendanceType     — the AttendanceType driving this session (config carries follow-up type)
  //   encounterType      — resolved EncounterType matching attendanceType.getFollowUpEncounterTypeUUID()
  //   programUUID        — if set, the encounterType is a program-encounter type; caller resolved this
  //                        via FormMapping. If null/undef, a general Encounter is created.
  //   studentLookup      — (subjectUUID) => Individual | null
  //   enrolmentLookup    — (student, programUUID) => ProgramEnrolment | null
  //                        only consulted when programUUID is set.
  autoCreateFollowUps({
    attendanceRecords,
    attendanceType,
    encounterType,
    programUUID,
    studentLookup,
    enrolmentLookup,
  } = {}) {
    if (!attendanceType) return [];
    const followUpEncounterTypeUUID = attendanceType.getFollowUpEncounterTypeUUID();
    if (!followUpEncounterTypeUUID) return [];
    if (!encounterType) return [];

    const base = moment(this.scheduledDate).startOf("day");
    const earliestVisit = base.clone().toDate();
    const maxVisit = base.clone().add(2, "days").toDate();
    const created = [];

    _.forEach(attendanceRecords || [], (record) => {
      if (!record) return;
      if (record.status !== AttendanceRecord.status.ABSENT) return;
      if (!_.isNil(record.reasonConceptUUID)) return;
      // Re-mark path: an existing AttendanceRecord may already point at a
      // previously-created follow-up encounter. Don't create a second one —
      // leave the link in place; voidStaleFollowUps handles the inverse case
      // (student transitioned out of "absent-no-reason").
      if (record.followUpEncounterUUID) return;
      const student = studentLookup ? studentLookup(record.subjectUUID) : null;
      if (!student) return;

      let encounter;
      if (programUUID) {
        const enrolment = enrolmentLookup ? enrolmentLookup(student, programUUID) : null;
        if (!enrolment) return;
        encounter = new ProgramEncounter();
        encounter.uuid = General.randomUUID();
        encounter.encounterType = encounterType;
        encounter.programEnrolment = enrolment;
        encounter.earliestVisitDateTime = earliestVisit;
        encounter.maxVisitDateTime = maxVisit;
        encounter.observations = [];
        encounter.cancelObservations = [];
        encounter.voided = false;
      } else {
        encounter = new Encounter();
        encounter.uuid = General.randomUUID();
        encounter.encounterType = encounterType;
        encounter.individual = student;
        encounter.earliestVisitDateTime = earliestVisit;
        encounter.maxVisitDateTime = maxVisit;
        encounter.observations = [];
        encounter.cancelObservations = [];
        encounter.voided = false;
      }
      record.followUpEncounterUUID = encounter.uuid;
      created.push(encounter);
    });

    return created;
  }

  // Void previously-auto-created follow-up encounters that are no longer warranted,
  // skipping any encounter that has been started (has observations) or completed.
  // Returns { voided: [...], skipped: [...] }.
  voidStaleFollowUps(previousRecords, newRecords, encounterLookup) {
    const result = {voided: [], skipped: []};
    const prevByStudent = _.keyBy(previousRecords || [], "subjectUUID");
    const newByStudent = _.keyBy(newRecords || [], "subjectUUID");

    _.forOwn(prevByStudent, (prev, studentUUID) => {
      if (!prev || !prev.followUpEncounterUUID) return;
      const next = newByStudent[studentUUID];
      const stillNeedsFollowUp =
        next &&
        next.status === AttendanceRecord.status.ABSENT &&
        _.isNil(next.reasonConceptUUID);
      if (stillNeedsFollowUp) return;
      const encounter = encounterLookup ? encounterLookup(prev.followUpEncounterUUID) : null;
      if (!encounter) return;
      const isScheduledNoObs =
        (_.isFunction(encounter.isScheduled) ? encounter.isScheduled() : _.isNil(encounter.encounterDateTime)) &&
        _.isEmpty(encounter.observations);
      if (isScheduledNoObs) {
        encounter.voided = true;
        result.voided.push(encounter);
      } else {
        result.skipped.push(encounter);
      }
    });

    return result;
  }

  static fromResource(resource) {
    const session = new Session();
    session.uuid = resource.uuid;
    session.groupSubjectUUID = resource.groupSubjectUUID;
    session.scheduledDate = resource.scheduledDate; // setter normalizes
    session.attendanceTypeUUID = resource.attendanceTypeUUID;
    session.status = resource.status;
    session.reasonConceptUUID = resource.reasonConceptUUID || null;
    session.notes = resource.notes || null;
    session.markedByUserName = resource.markedByUserName || null;
    // markedAt is a true timestamp (not a calendar date) — preserve the instant.
    session.markedAt = _.isNil(resource.markedAt) ? null : new Date(resource.markedAt);
    session.voided = !!resource.voided;
    mapAuditFields(session, resource);
    return session;
  }

  get toResource() {
    const resource = _.pick(this, [
      "uuid",
      "groupSubjectUUID",
      "scheduledDate",
      "attendanceTypeUUID",
      "status",
      "markedByUserName",
      "voided",
    ]);
    resource.markedAt = _.isNil(this.markedAt) ? null : moment(this.markedAt).format();
    resource.reasonConceptUUID = this.reasonConceptUUID || null;
    resource.notes = this.notes || null;
    return resource;
  }
}

export default Session;
