import _ from "lodash";
import moment from "moment";

const CALENDAR_DATE_FORMAT = "YYYY-MM-DD";

class DateTimeUtil {
  static validateDateRange(fromDate, toDate) {
    if (_.isNil(toDate) && _.isNil(fromDate))
      return [true];

    if (_.isNil(toDate) || _.isNil(fromDate))
      return [false, 'bothDateShouldBeSelectedError'];

    if (!moment(fromDate).isSameOrBefore(toDate))
       return [false, 'startDateGreaterThanEndError'];

    return [true];
  }

  static validateTimeRange(fromTime, toTime) {
    if (_.isNil(toTime) && _.isNil(fromTime))
      return [true];

    if (_.isNil(toTime) || _.isNil(fromTime))
      return [false, 'bothTimeShouldBeSelectedError'];

    if (!moment(fromTime, 'HH:mm').isSameOrBefore(moment(toTime, 'HH:mm')))
      return [false, 'startTimeGreaterThanEndError'];

    return [true];
  }

  // Calendar-date helpers.
  //
  // Calendar dates are Postgres `date` values on the server — no time, no zone.
  // We mirror that exactly on the client by storing them as plain `"YYYY-MM-DD"`
  // strings in Realm and returning them as strings from accessors. This makes
  // it impossible to introduce timezone bugs at the storage layer.
  //
  // These helpers also accept JS `Date` inputs for convenience — they're
  // normalised via UTC components so a caller who built a Date with
  // `moment.utc(...)` or `DateTimeUtil.calendarDateToDate(string)` gets the
  // day they wrote; a caller who hands in a local-midnight Date or a
  // `new Date()` will see the UTC calendar day at that instant, which is
  // the closest TZ-stable reading we can compute.
  static toCalendarDateString(value) {
    if (_.isNil(value)) return null;
    if (_.isString(value)) {
      // Canonicalise via moment.utc round-trip so "2026-05-9" → "2026-05-09",
      // and any unsupported shape returns null rather than corrupt storage.
      const m = moment.utc(value, CALENDAR_DATE_FORMAT, true);
      return m.isValid() ? m.format(CALENDAR_DATE_FORMAT) : null;
    }
    return moment.utc(value).format(CALENDAR_DATE_FORMAT);
  }

  // For arithmetic on calendar dates (next/previous day, day-of-week extraction).
  // Returns a moment in UTC mode anchored at start-of-day.
  static calendarMoment(value) {
    if (_.isNil(value)) return null;
    if (_.isString(value)) return moment.utc(value, CALENDAR_DATE_FORMAT).startOf("day");
    return moment.utc(value).startOf("day");
  }

  // Optional: turn a stored "YYYY-MM-DD" back into a JS Date at UTC midnight,
  // for callers (e.g. UI components) that need a Date object. Display code that
  // uses this MUST format via `moment.utc(...)` or risk a TZ shift.
  static calendarDateToDate(value) {
    if (_.isNil(value)) return null;
    if (_.isString(value)) {
      return moment.utc(value, CALENDAR_DATE_FORMAT).startOf("day").toDate();
    }
    return moment.utc(value).startOf("day").toDate();
  }
}

export default DateTimeUtil;
