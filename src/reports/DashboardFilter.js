import BaseEntity from "../BaseEntity";
import Dashboard from "../Dashboard";
import General from "../utility/General";
import ResourceUtil from "../utility/ResourceUtil";

class DashboardFilter extends BaseEntity {
  static schema = {
    name: "DashboardFilter",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      dashboard: "Dashboard",
      name: "string",
      filterConfig: "string",
      voided: {type: "bool", default: false}
    },
  };

  constructor(that = null) {
    super(that);
  }

  get dashboard() {
      return this.toEntity("dashboard", Dashboard);
  }

  set dashboard(x) {
      this.that.dashboard = this.fromObject(x);
  }

  get filter() {
      return this.that.filter;
  }

  set filter(x) {
      this.that.filter = x;
  }

  static fromResource(resource, entityService) {
    const dashboardFilter = General.assignFields(resource, new DashboardFilter(),
      ["uuid", "voided"]);
    dashboardFilter.filter = JSON.stringify(resource["filter"]);
    dashboardFilter.dashboard = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "dashboardUUID"),
      Dashboard.schema.name
    );
    return dashboardFilter;
  }
}

export default DashboardFilter;
