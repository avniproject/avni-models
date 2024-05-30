import BaseEntity from "./BaseEntity";
import Dashboard from "./Dashboard";
import General from "./utility/General";

class CustomDashboardCache extends BaseEntity {
    static schema = {
        name: "CustomDashboardCache",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            dashboard: "Dashboard",
            updatedAt: "date",
            selectedValuesJSON: "string",
            filterApplied: "bool"
        }
    };

    constructor(that = null) {
        super(that);
    }

    get updatedAt() {
        return this.that.updatedAt;
    }

    set updatedAt(x) {
        this.that.updatedAt = x;
    }

    get selectedValuesJSON() {
        return this.that.selectedValuesJSON;
    }

    set selectedValuesJSON(x) {
        this.that.selectedValuesJSON = x;
    }

    get filterApplied() {
        return this.that.filterApplied;
    }

    set filterApplied(x) {
        this.that.filterApplied = x;
    }

    get dashboard() {
        return this.toEntity("dashboard", Dashboard);
    }

    set dashboard(x) {
        this.that.dashboard = this.fromObject(x);
    }

    static create(uuid, updatedAt, selectedValuesJSON = '{}', filterApplied) {
        const customDashboardCache = new CustomDashboardCache();
        customDashboardCache.uuid = uuid;
        customDashboardCache.updatedAt = updatedAt;
        customDashboardCache.selectedValuesJSON = selectedValuesJSON;
        customDashboardCache.filterApplied = filterApplied;
        return customDashboardCache;
    }

    static newInstance(dashboard) {
        const customDashboardCache = new CustomDashboardCache();
        customDashboardCache.uuid = General.randomUUID();
        customDashboardCache.dashboard = dashboard;
        customDashboardCache.reset();
        return customDashboardCache;
    }

    reset() {
        this.filterApplied = false;
        this.selectedValuesJSON = JSON.stringify({});
        this.updatedAt = new Date();
    }

    getSelectedValues() {
        return JSON.parse(this.selectedValuesJSON);
    }

    clone() {
        const customDashboardCache = new CustomDashboardCache();
        customDashboardCache.uuid = this.uuid;
        customDashboardCache.dashboard = this.dashboard;
        customDashboardCache.updatedAt = this.updatedAt;
        customDashboardCache.selectedValuesJSON = this.selectedValuesJSON;
        customDashboardCache.filterApplied = this.filterApplied;
        return customDashboardCache;
    }
}

export default CustomDashboardCache
