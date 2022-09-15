import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import Dashboard from "./Dashboard";
import ReportCard from "./ReportCard";
import ResourceUtil from "./utility/ResourceUtil";
import DashboardSection from "./DashboardSection";

class DashboardSectionCardMapping extends BaseEntity {

    static schema = {
        name: "DashboardSectionCardMapping",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            dashboardSection: "DashboardSection",
            card: "ReportCard",
            displayOrder: "double",
            voided: {type: "bool", default: false},
        },
    };


  constructor(that) {
    super(that);
  }

  get dashboardSection() {
      return this.toEntity("dashboardSection", DashboardSection);
  }

  set dashboardSection(x) {
      this.that.dashboardSection = x;
  }

  get card() {
      return this.toEntity("card", ReportCard);
  }

  set card(x) {
      this.that.card = x;
  }

  get displayOrder() {
      return this.that.displayOrder;
  }

  set displayOrder(x) {
      this.that.displayOrder = x;
  }

  static fromResource(resource, entityService) {
        const dashboardSectionCardMapping = General.assignFields(resource, new DashboardSectionCardMapping(),
            ["uuid", "displayOrder", "voided"]);
        dashboardSectionCardMapping.dashboardSection = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "dashboardSectionUUID"),
            DashboardSection.schema.name
        );
        dashboardSectionCardMapping.card = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "cardUUID"),
            ReportCard.schema.name
        );
        return dashboardSectionCardMapping;
    }
}

export default DashboardSectionCardMapping;
