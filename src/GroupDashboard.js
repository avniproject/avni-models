import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import ResourceUtil from "./utility/ResourceUtil";
import Groups from "./Groups";
import Dashboard from "./Dashboard";

class GroupDashboard extends BaseEntity {
    static schema = {
        name: "GroupDashboard",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            primaryDashboard: {type: "bool", default: false},
            group: {type: "Groups", optional: true},
            dashboard: "Dashboard",
            voided: {type: "bool", default: false}
        },
    };

    static fromResource(resource, entityService) {
        const groupDashboard = General.assignFields(resource, new GroupDashboard(), ["uuid", "primaryDashboard", "voided"]);
        groupDashboard.group = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "groupUUID"),
            Groups.schema.name
        );
        groupDashboard.dashboard = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "dashboardUUID"),
            Dashboard.schema.name
        );
        return groupDashboard;
    }
}


export default GroupDashboard;
