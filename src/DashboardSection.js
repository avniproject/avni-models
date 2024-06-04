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

    get viewType() {
        return this.that.viewType;
    }

    set viewType(x) {
        this.that.viewType = x;
    }

    get displayOrder() {
        return this.that.displayOrder;
    }

    set displayOrder(x) {
        this.that.displayOrder = x;
    }

    static viewTypeName = {
        Tile: 'Tile',
        List: 'List',
        Default: 'Default'
    };

    static fromResource(resource, entityService) {
        const dashboardSection = General.assignFields(resource, new DashboardSection(),
            ["uuid", "name", "description", "viewType", "displayOrder", "voided"]);
        dashboardSection.dashboard = entityService.findByKey(
            "uuid",
            resource.dashboardUUID,
            Dashboard.schema.name
        );
        return dashboardSection;
    }

}

export default DashboardSection;
