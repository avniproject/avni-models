import CalendarDateMarker from "../src/CalendarDateMarker";
import DateTimeUtil from "../src/utility/DateTimeUtil";

describe("CalendarDateMarker", () => {
  it("stores markerDate as a plain YYYY-MM-DD string from fromResource", () => {
    const marker = CalendarDateMarker.fromResource({
      uuid: "m-1",
      calendarUUID: "cal-1",
      markerDate: "2026-11-09",
      name: "Diwali",
      isWorking: false,
      voided: false,
    });
    expect(marker.markerDate).toBe("2026-11-09");
    expect(typeof marker.markerDate).toBe("string");
  });

  it("toResource emits the same YYYY-MM-DD string", () => {
    const marker = CalendarDateMarker.fromResource({
      uuid: "m-2",
      calendarUUID: "cal-1",
      markerDate: "2026-01-26",
      name: "Republic Day",
      isWorking: false,
    });
    expect(marker.toResource.markerDate).toBe("2026-01-26");
  });

  it("the setter normalises a JS Date input to YYYY-MM-DD via UTC components", () => {
    const marker = new CalendarDateMarker();
    marker.markerDate = DateTimeUtil.calendarDateToDate("2026-08-15");
    expect(marker.markerDate).toBe("2026-08-15");
  });

  it("rejects malformed input by returning null (storage stays canonical)", () => {
    const marker = new CalendarDateMarker();
    marker.markerDate = "not-a-date";
    expect(marker.markerDate).toBeNull();
  });

  it("populates audit fields from the _links envelope", () => {
    const marker = CalendarDateMarker.fromResource({
      uuid: "m-4",
      calendarUUID: "cal-1",
      markerDate: "2026-12-25",
      name: "Christmas",
      isWorking: false,
      _links: {
        createdBy: {href: "alice"},
        createdByUUID: {href: "u-alice"},
        lastModifiedBy: {href: "bob"},
        lastModifiedByUUID: {href: "u-bob"},
      },
    });
    expect(marker.createdBy).toBe("alice");
    expect(marker.lastModifiedByUUID).toBe("u-bob");
  });
});
