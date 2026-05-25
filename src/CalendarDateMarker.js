import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import SchemaNames from "./SchemaNames";
import {AuditFields, mapAuditFields} from "./utility/AuditUtil";
import DateTimeUtil from "./utility/DateTimeUtil";
import _ from "lodash";

class CalendarDateMarker extends BaseEntity {
  static schema = {
    name: SchemaNames.CalendarDateMarker,
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      calendarUUID: "string",
      // markerDate is stored as a "YYYY-MM-DD" string so it carries zero TZ
      // semantics. Mirrors the Postgres `date` type on the server side.
      markerDate: "string",
      name: "string",
      isWorking: {type: "bool", default: false},
      voided: {type: "bool", default: false},
      ...AuditFields,
    },
  };

  constructor(that = null) {
    super(that);
  }

  get calendarUUID() {
    return this.that.calendarUUID;
  }

  set calendarUUID(x) {
    this.that.calendarUUID = x;
  }

  get markerDate() {
    return this.that.markerDate;
  }

  // Accepts either a "YYYY-MM-DD" string or a JS Date; persists as a canonical
  // "YYYY-MM-DD" string so storage carries zero TZ semantics.
  set markerDate(x) {
    this.that.markerDate = DateTimeUtil.toCalendarDateString(x);
  }

  get name() {
    return this.that.name;
  }

  set name(x) {
    this.that.name = x;
  }

  get isWorking() {
    return this.that.isWorking;
  }

  set isWorking(x) {
    this.that.isWorking = x;
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

  static fromResource(resource) {
    const marker = new CalendarDateMarker();
    marker.uuid = resource.uuid;
    marker.calendarUUID = resource.calendarUUID;
    marker.markerDate = DateTimeUtil.toCalendarDateString(resource.markerDate);
    marker.name = resource.name;
    marker.isWorking = !!resource.isWorking;
    marker.voided = !!resource.voided;
    mapAuditFields(marker, resource);
    return marker;
  }

  get toResource() {
    return _.pick(this, ["uuid", "calendarUUID", "markerDate", "name", "isWorking", "voided"]);
  }
}

export default CalendarDateMarker;
