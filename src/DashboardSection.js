import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import Dashboard from "./Dashboard";


class DashboardSection extends BaseEntity {

    static schema = {
        name: "DashboardSection",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            dashboard: "Dashboard",
            name: {type: "string", optional: true},
            description: {type: "string", optional: true},
            viewType: "string",
            displayOrder: "double",
            voided: {type: "bool", default: false},
        },
    };

  mapNonPrimitives(realmObject, entityMapper) {
    this.dashboard = entityMapper.toEntity(realmObject.dashboard, Dashboard);
  }

    static viewTypeName = {
        Tile: 'Tile',
        List: 'List',
        Default: 'Default'
    };

    static fromResource(resource, entityService) {
        const dashboardSection = General.assignFields(resource, new DashboardSection(),
            ["uuid", "name", "description", "viewType", "displayOrder", "voided"]);
        dashboardSection.dashboard = entityService.findEntity(
            "uuid",
            resource.dashboardUUID,
            Dashboard.schema.name
        );
        return dashboardSection;
    }

}

export default DashboardSection;
