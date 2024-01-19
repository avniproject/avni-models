import DashboardCache from "../src/DashboardCache";
import {assert} from "chai";

it('should get filter from string', function () {
  const dashboardCache = DashboardCache.createEmptyInstance();
  let filter = dashboardCache.getFilter();
  filter.filterDate = new Date();
  dashboardCache.setFilter(filter);
  const filterDate = dashboardCache.getFilter().filterDate;
  assert.notEqual(filterDate, null);
  assert.notEqual(filterDate.getYear, null);
});
