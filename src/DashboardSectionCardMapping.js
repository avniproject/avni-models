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

  mapNonPrimitives(realmObject, entityMapper) {
    this.dashboardSection = entityMapper.toEntity(realmObject.dashboardSection, DashboardSection);
    this.card = entityMapper.toEntity(realmObject.card, ReportCard);
  }

    static fromResource(resource, entityService) {
        const dashboardSectionCardMapping = General.assignFields(resource, new DashboardSectionCardMapping(),
            ["uuid", "displayOrder", "voided"]);
        dashboardSectionCardMapping.dashboardSection = entityService.findEntity(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "dashboardSectionUUID"),
            DashboardSection.schema.name
        );
        dashboardSectionCardMapping.card = entityService.findEntity(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "cardUUID"),
            ReportCard.schema.name
        );
        return dashboardSectionCardMapping;
    }
}

export default DashboardSectionCardMapping;
