import Calendar from "../src/Calendar";
import CalendarDateMarker from "../src/CalendarDateMarker";
import General from "../src/utility/General";

// Calendar-date inputs are plain "YYYY-MM-DD" strings throughout the test file.
// No JS Date objects, no timezone arithmetic.

function newCalendar({pattern, uuid, name = "Cal", addressLevelUUID = null} = {}) {
  const cal = new Calendar();
  cal.uuid = uuid || General.randomUUID();
  cal.name = name;
  cal.workingPattern = JSON.stringify(pattern || Calendar.defaultWorkingPattern);
  cal.addressLevelUUID = addressLevelUUID;
  cal.isDefault = false;
  cal.voided = false;
  return cal;
}

function newMarker({calendarUUID, date, name, isWorking = false, voided = false} = {}) {
  const m = new CalendarDateMarker();
  m.uuid = General.randomUUID();
  m.calendarUUID = calendarUUID;
  m.markerDate = date;
  m.name = name;
  m.isWorking = isWorking;
  m.voided = voided;
  return m;
}

describe("Calendar", () => {
  describe("default working pattern (Mon-Fri working, Sat/Sun off)", () => {
    const cal = newCalendar();

    it("Monday is a working day", () => {
      expect(cal.isWorkingDay("2026-05-04")).toBe(true);
      expect(cal.isHoliday("2026-05-04")).toBe(false);
      expect(cal.dayType("2026-05-04")).toBe(Calendar.dayType.WORKING_DAY);
    });

    it("Saturday is a holiday (weekly_off)", () => {
      expect(cal.isHoliday("2026-05-02")).toBe(true);
      expect(cal.dayType("2026-05-02")).toBe(Calendar.dayType.WEEKLY_OFF);
    });

    it("Sunday is a holiday (weekly_off)", () => {
      expect(cal.isHoliday("2026-05-31")).toBe(true);
      expect(cal.dayType("2026-05-31")).toBe(Calendar.dayType.WEEKLY_OFF);
    });

    it("nextWorkingDay(Friday) returns the following Monday", () => {
      expect(cal.nextWorkingDay("2026-05-01")).toBe("2026-05-04");
    });

    it("previousWorkingDay(Monday) returns the previous Friday", () => {
      expect(cal.previousWorkingDay("2026-05-04")).toBe("2026-05-01");
    });
  });

  describe("Bengaluru schools pattern (sat: [1,3,5])", () => {
    const cal = newCalendar({
      pattern: {mon: "all", tue: "all", wed: "all", thu: "all", fri: "all", sat: [1, 3, 5], sun: "none"},
    });

    it("1st Saturday (May 2) is a working day", () => {
      expect(cal.isHoliday("2026-05-02")).toBe(false);
      expect(cal.dayType("2026-05-02")).toBe(Calendar.dayType.WORKING_DAY);
    });

    it("2nd Saturday (May 9) is a weekly off", () => {
      expect(cal.isHoliday("2026-05-09")).toBe(true);
      expect(cal.dayType("2026-05-09")).toBe(Calendar.dayType.WEEKLY_OFF);
    });

    it("3rd Saturday (May 16) is a working day", () => {
      expect(cal.isHoliday("2026-05-16")).toBe(false);
    });

    it("4th Saturday (May 23) is a weekly off", () => {
      expect(cal.isHoliday("2026-05-23")).toBe(true);
    });

    it("5th Saturday (May 30) is a working day", () => {
      expect(cal.isHoliday("2026-05-30")).toBe(false);
    });
  });

  describe("date marker overrides", () => {
    const cal = newCalendar();
    const sundayWorking = newMarker({
      calendarUUID: cal.uuid,
      date: "2026-05-31", // Sunday
      name: "Make-up day",
      isWorking: true,
    });
    const wednesdayHoliday = newMarker({
      calendarUUID: cal.uuid,
      date: "2026-05-06", // Wednesday
      name: "Founder's day",
      isWorking: false,
    });

    it("isWorking marker on Sunday flips it to working_override", () => {
      expect(cal.isHoliday("2026-05-31", [sundayWorking])).toBe(false);
      expect(cal.dayType("2026-05-31", [sundayWorking])).toBe(Calendar.dayType.WORKING_OVERRIDE);
    });

    it("isWorking=false marker on Wednesday flips it to public_holiday", () => {
      expect(cal.isHoliday("2026-05-06", [wednesdayHoliday])).toBe(true);
      expect(cal.dayType("2026-05-06", [wednesdayHoliday])).toBe(Calendar.dayType.PUBLIC_HOLIDAY);
    });

    it("voided markers are ignored", () => {
      const voided = newMarker({
        calendarUUID: cal.uuid,
        date: "2026-05-06",
        name: "Was a holiday",
        isWorking: false,
        voided: true,
      });
      expect(cal.dayType("2026-05-06", [voided])).toBe(Calendar.dayType.WORKING_DAY);
    });

    it("markers for a different calendar are ignored", () => {
      const otherCalMarker = newMarker({
        calendarUUID: "other-cal-uuid",
        date: "2026-05-06",
        name: "Other org holiday",
        isWorking: false,
      });
      expect(cal.dayType("2026-05-06", [otherCalMarker])).toBe(Calendar.dayType.WORKING_DAY);
    });
  });

  describe("nextWorkingDay bounded scan", () => {
    it("throws when no working day is found within 365 days", () => {
      const cal = newCalendar({
        pattern: {mon: "none", tue: "none", wed: "none", thu: "none", fri: "none", sat: "none", sun: "none"},
      });
      expect(() => cal.nextWorkingDay("2026-05-01")).toThrow(/no working day/);
    });
  });

  describe("getHolidays", () => {
    const cal = newCalendar();
    const diwali = newMarker({calendarUUID: cal.uuid, date: "2026-11-09", name: "Diwali"});
    const republicDay = newMarker({calendarUUID: cal.uuid, date: "2026-01-26", name: "Republic Day"});
    const workingOverride = newMarker({
      calendarUUID: cal.uuid,
      date: "2026-03-14",
      name: "Make-up Saturday",
      isWorking: true,
    });
    const voidedHoliday = newMarker({
      calendarUUID: cal.uuid,
      date: "2026-05-01",
      name: "Was a holiday",
      voided: true,
    });
    const markers = [diwali, republicDay, workingOverride, voidedHoliday];

    it("returns only non-voided public holidays in the date range", () => {
      const holidays = cal.getHolidays("2026-01-01", "2026-12-31", markers);
      expect(holidays.map((h) => h.name)).toEqual(["Republic Day", "Diwali"]);
    });

    it("excludes working-override markers", () => {
      const holidays = cal.getHolidays("2026-03-01", "2026-03-31", markers);
      expect(holidays).toHaveLength(0);
    });

    it("excludes holidays outside the date range", () => {
      const holidays = cal.getHolidays("2026-02-01", "2026-02-28", markers);
      expect(holidays).toHaveLength(0);
    });

    it("the excluded working-override date is still reported as WORKING_OVERRIDE by dayType", () => {
      expect(cal.dayType("2026-03-14", markers)).toBe(Calendar.dayType.WORKING_OVERRIDE);
      expect(cal.isHoliday("2026-03-14", markers)).toBe(false);
    });
  });

  describe("fromResource / toResource", () => {
    it("accepts workingPattern as a parsed object and round-trips through dayType", () => {
      const cal = Calendar.fromResource({
        uuid: "cal-1",
        name: "Karnataka",
        workingPattern: {mon: "all", tue: "all", wed: "all", thu: "all", fri: "all", sat: [1, 3, 5], sun: "none"},
        addressLevelUUID: "al-1",
        isDefault: false,
        voided: false,
      });
      expect(typeof cal.workingPattern).toBe("string");
      expect(cal.getWorkingPatternObject().sat).toEqual([1, 3, 5]);
      expect(cal.dayType("2026-05-09")).toBe(Calendar.dayType.WEEKLY_OFF); // 2nd Sat
      expect(cal.dayType("2026-05-16")).toBe(Calendar.dayType.WORKING_DAY); // 3rd Sat
    });

    it("accepts workingPattern as a string", () => {
      const patternStr = JSON.stringify({mon: "all", tue: "all", wed: "all", thu: "all", fri: "all", sat: "none", sun: "none"});
      const cal = Calendar.fromResource({
        uuid: "cal-2",
        name: "Default",
        workingPattern: patternStr,
        addressLevelUUID: null,
        isDefault: true,
        voided: false,
      });
      expect(cal.workingPattern).toBe(patternStr);
    });

    it("defaults workingPattern when omitted", () => {
      const cal = Calendar.fromResource({uuid: "cal-3", name: "Bare"});
      expect(cal.getWorkingPatternObject()).toEqual(Calendar.defaultWorkingPattern);
    });

    it("toResource emits a string workingPattern + addressLevelUUID", () => {
      const cal = Calendar.fromResource({
        uuid: "cal-4",
        name: "Karnataka",
        workingPattern: {sat: [1, 3, 5]},
        addressLevelUUID: "al-99",
        isDefault: false,
      });
      const resource = cal.toResource;
      expect(typeof resource.workingPattern).toBe("string");
      expect(JSON.parse(resource.workingPattern).sat).toEqual([1, 3, 5]);
      expect(resource.addressLevelUUID).toBe("al-99");
    });

    it("populates audit fields from the resource _links envelope", () => {
      const cal = Calendar.fromResource({
        uuid: "cal-5",
        name: "Audited",
        _links: {
          createdBy: {href: "alice"},
          createdByUUID: {href: "u-alice"},
          lastModifiedBy: {href: "bob"},
          lastModifiedByUUID: {href: "u-bob"},
        },
      });
      expect(cal.createdBy).toBe("alice");
      expect(cal.createdByUUID).toBe("u-alice");
      expect(cal.lastModifiedBy).toBe("bob");
      expect(cal.lastModifiedByUUID).toBe("u-bob");
    });
  });
});
