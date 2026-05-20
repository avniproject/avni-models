import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import SchemaNames from "./SchemaNames";
import {AuditFields, mapAuditFields} from "./utility/AuditUtil";
import DateTimeUtil from "./utility/DateTimeUtil";
import _ from "lodash";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const DEFAULT_WORKING_PATTERN = {
  mon: "all",
  tue: "all",
  wed: "all",
  thu: "all",
  fri: "all",
  sat: "none",
  sun: "none",
};

class Calendar extends BaseEntity {
  static schema = {
    name: SchemaNames.Calendar,
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      name: "string",
      workingPattern: {type: "string", default: JSON.stringify(DEFAULT_WORKING_PATTERN)},
      addressLevelUUID: {type: "string", optional: true},
      isDefault: {type: "bool", default: false},
      voided: {type: "bool", default: false},
      ...AuditFields,
    },
  };

  static dayType = {
    WORKING_DAY: "working_day",
    WEEKLY_OFF: "weekly_off",
    PUBLIC_HOLIDAY: "public_holiday",
    WORKING_OVERRIDE: "working_override",
  };

  static defaultWorkingPattern = DEFAULT_WORKING_PATTERN;

  constructor(that = null) {
    super(that);
  }

  get name() {
    return this.that.name;
  }

  set name(x) {
    this.that.name = x;
  }

  get workingPattern() {
    return this.that.workingPattern;
  }

  set workingPattern(x) {
    this.that.workingPattern = x;
  }

  get addressLevelUUID() {
    return this.that.addressLevelUUID;
  }

  set addressLevelUUID(x) {
    this.that.addressLevelUUID = x;
  }

  get isDefault() {
    return this.that.isDefault;
  }

  set isDefault(x) {
    this.that.isDefault = x;
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

  getWorkingPatternObject() {
    if (_.isEmpty(this.workingPattern)) return DEFAULT_WORKING_PATTERN;
    try {
      return JSON.parse(this.workingPattern);
    } catch (_e) {
      return DEFAULT_WORKING_PATTERN;
    }
  }

  // Domain methods accept a calendar-date input as either a "YYYY-MM-DD" string
  // or a JS Date. All comparisons happen on canonical "YYYY-MM-DD" strings;
  // arithmetic uses moment.utc internally. Methods that return a calendar-date
  // value return a "YYYY-MM-DD" string — never a Date — so consumers can't
  // accidentally drift via locale-aware formatting.

  _findActiveMarker(dateKey, markers) {
    if (_.isEmpty(markers) || _.isNil(dateKey)) return null;
    return _.find(markers, (m) => {
      if (!m || m.voided) return false;
      if (m.calendarUUID !== this.uuid) return false;
      return DateTimeUtil.toCalendarDateString(m.markerDate) === dateKey;
    }) || null;
  }

  dayType(date, markers = []) {
    const dateKey = DateTimeUtil.toCalendarDateString(date);
    if (_.isNil(dateKey)) return Calendar.dayType.WEEKLY_OFF;
    const marker = this._findActiveMarker(dateKey, markers);
    if (marker) {
      return marker.isWorking ? Calendar.dayType.WORKING_OVERRIDE : Calendar.dayType.PUBLIC_HOLIDAY;
    }
    const d = DateTimeUtil.calendarMoment(dateKey);
    const dayKey = DAY_KEYS[d.day()];
    const dayOfMonth = d.date();
    const occurrence = Math.floor((dayOfMonth - 1) / 7) + 1;
    const pattern = this.getWorkingPatternObject();
    const slot = pattern[dayKey];
    if (slot === "all") return Calendar.dayType.WORKING_DAY;
    if (slot === "none") return Calendar.dayType.WEEKLY_OFF;
    if (_.isArray(slot)) {
      return _.includes(slot, occurrence) ? Calendar.dayType.WORKING_DAY : Calendar.dayType.WEEKLY_OFF;
    }
    return Calendar.dayType.WEEKLY_OFF;
  }

  isHoliday(date, markers = []) {
    const t = this.dayType(date, markers);
    return t === Calendar.dayType.WEEKLY_OFF || t === Calendar.dayType.PUBLIC_HOLIDAY;
  }

  isWorkingDay(date, markers = []) {
    return !this.isHoliday(date, markers);
  }

  // Returns [{date: "YYYY-MM-DD", name}] sorted by date.
  getHolidays(startDate, endDate, markers = []) {
    if (_.isEmpty(markers)) return [];
    const startKey = DateTimeUtil.toCalendarDateString(startDate);
    const endKey = DateTimeUtil.toCalendarDateString(endDate);
    if (_.isNil(startKey) || _.isNil(endKey)) return [];
    return _.chain(markers)
      .filter((m) => m && !m.voided && m.calendarUUID === this.uuid && m.isWorking === false)
      .map((m) => ({date: DateTimeUtil.toCalendarDateString(m.markerDate), name: m.name}))
      .filter((h) => !_.isNil(h.date) && h.date >= startKey && h.date <= endKey)
      .sortBy("date")
      .value();
  }

  // Returns "YYYY-MM-DD" (string), bounded scan ≤365 days, throws on exceed.
  nextWorkingDay(date, markers = []) {
    const startKey = DateTimeUtil.toCalendarDateString(date);
    if (_.isNil(startKey)) throw new Error("Calendar.nextWorkingDay: invalid date");
    let cursor = DateTimeUtil.calendarMoment(startKey).add(1, "day");
    for (let i = 0; i < 365; i++) {
      const key = cursor.format("YYYY-MM-DD");
      if (this.isWorkingDay(key, markers)) return key;
      cursor.add(1, "day");
    }
    throw new Error(`Calendar '${this.name}': no working day found within 365 days after ${startKey}`);
  }

  // Returns "YYYY-MM-DD" (string), symmetric bounded scan.
  previousWorkingDay(date, markers = []) {
    const startKey = DateTimeUtil.toCalendarDateString(date);
    if (_.isNil(startKey)) throw new Error("Calendar.previousWorkingDay: invalid date");
    let cursor = DateTimeUtil.calendarMoment(startKey).subtract(1, "day");
    for (let i = 0; i < 365; i++) {
      const key = cursor.format("YYYY-MM-DD");
      if (this.isWorkingDay(key, markers)) return key;
      cursor.subtract(1, "day");
    }
    throw new Error(`Calendar '${this.name}': no working day found within 365 days before ${startKey}`);
  }

  static fromResource(resource) {
    const calendar = new Calendar();
    calendar.uuid = resource.uuid;
    calendar.name = resource.name;
    const pattern = resource.workingPattern;
    if (_.isNil(pattern)) {
      calendar.workingPattern = JSON.stringify(DEFAULT_WORKING_PATTERN);
    } else if (_.isString(pattern)) {
      calendar.workingPattern = pattern;
    } else {
      calendar.workingPattern = JSON.stringify(pattern);
    }
    calendar.addressLevelUUID = resource.addressLevelUUID || null;
    calendar.isDefault = !!resource.isDefault;
    calendar.voided = !!resource.voided;
    mapAuditFields(calendar, resource);
    return calendar;
  }

  get toResource() {
    const resource = _.pick(this, ["uuid", "name", "workingPattern", "isDefault", "voided"]);
    resource.addressLevelUUID = this.addressLevelUUID || null;
    return resource;
  }
}

export default Calendar;
