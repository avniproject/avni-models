import DashboardSection from "../src/DashboardSection";

describe("DashboardSection", () => {
  it("has a FullPage view type", () => {
    expect(DashboardSection.viewTypeName.FullPage).toBe("FullPage");
  });
});
