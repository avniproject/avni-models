import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import DashboardFilter from "./reports/DashboardFilter";

class Dashboard extends BaseEntity {
  static schema = {
    name: "Dashboard",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      name: "string",
      description: {type: "string", optional: true},
      filters: {type: "list", objectType: "DashboardFilter"},
      voided: {type: "bool", default: false}
    },
  };

  constructor(that = null) {
    super(that);
  }

  get name() {
    return this.that.name;
  }

  set name(x) {
    this.that.name = x;
  }

  get description() {
    return this.that.description;
  }

  set description(x) {
    this.that.description = x;
  }

  static fromResource(resource) {
    return General.assignFields(resource, new Dashboard(),
      ["uuid", "name", "description", "voided"]);
  }

  static merge = () => BaseEntity.mergeOn("filters");

  static associateChild(child, childEntityClass, childResource, entityService) {
    let dashboard = BaseEntity.getParentEntity(
      entityService,
      childEntityClass,
      childResource,
      "dashboardUUID",
      Dashboard.schema.name
    );
    dashboard = General.pick(dashboard, ["uuid"], ["filters"]);

    if (childEntityClass === DashboardFilter) BaseEntity.addNewChild(child, dashboard.filters);
    return dashboard;
  }
}

export default Dashboard;
