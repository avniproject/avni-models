import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import Dashboard from "./Dashboard";
import ReportCard from "./ReportCard";

class DashboardCardMapping extends BaseEntity {

    static schema = {
        name: "DashboardCardMapping",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            dashboard: "Dashboard",
            card: "ReportCard",
            displayOrder: "double",
            voided: {type: "bool", default: false},
        },
    };

    static fromResource(resource, entityService) {
        const dashboardCardMapping = General.assignFields(resource, new DashboardCardMapping(),
            ["uuid", "displayOrder", "voided"]);
        const card = entityService.findByKey(
            "uuid",
            resource.cardUUID,
            ReportCard.schema.name
        );
        const dashboard = entityService.findByKey(
            "uuid",
            resource.dashboardUUID,
            Dashboard.schema.name
        );
        dashboardCardMapping.card = card;
        dashboardCardMapping.dashboard = dashboard;

        return dashboardCardMapping;
    }
}

export default DashboardCardMapping;
