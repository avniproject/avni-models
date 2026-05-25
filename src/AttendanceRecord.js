import BaseEntity from "./BaseEntity";
import SchemaNames from "./SchemaNames";
import {AuditFields, mapAuditFields} from "./utility/AuditUtil";
import _ from "lodash";

class AttendanceRecord extends BaseEntity {
  static schema = {
    name: SchemaNames.AttendanceRecord,
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      sessionUUID: "string",
      subjectUUID: "string",
      status: "string",
      reasonConceptUUID: {type: "string", optional: true},
      followUpEncounterUUID: {type: "string", optional: true},
      voided: {type: "bool", default: false},
      ...AuditFields,
    },
  };

  static status = {
    PRESENT: "Present",
    ABSENT: "Absent",
  };

  constructor(that = null) {
    super(that);
  }

  get sessionUUID() {
    return this.that.sessionUUID;
  }

  set sessionUUID(x) {
    this.that.sessionUUID = x;
  }

  get subjectUUID() {
    return this.that.subjectUUID;
  }

  set subjectUUID(x) {
    this.that.subjectUUID = x;
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

  get followUpEncounterUUID() {
    return this.that.followUpEncounterUUID;
  }

  set followUpEncounterUUID(x) {
    this.that.followUpEncounterUUID = x;
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

  isPresent() {
    return this.status === AttendanceRecord.status.PRESENT;
  }

  isAbsent() {
    return this.status === AttendanceRecord.status.ABSENT;
  }

  static fromResource(resource) {
    const record = new AttendanceRecord();
    record.uuid = resource.uuid;
    record.sessionUUID = resource.sessionUUID;
    record.subjectUUID = resource.subjectUUID;
    record.status = resource.status;
    record.reasonConceptUUID = resource.reasonConceptUUID || null;
    record.followUpEncounterUUID = resource.followUpEncounterUUID || null;
    record.voided = !!resource.voided;
    mapAuditFields(record, resource);
    return record;
  }

  get toResource() {
    const resource = _.pick(this, ["uuid", "sessionUUID", "subjectUUID", "status", "voided"]);
    resource.reasonConceptUUID = this.reasonConceptUUID || null;
    resource.followUpEncounterUUID = this.followUpEncounterUUID || null;
    return resource;
  }
}

export default AttendanceRecord;
