import BaseEntity from "./BaseEntity";
import Dashboard from "./Dashboard";
import General from "./utility/General";
import ReportCardResult from "./reports/ReportCardResult";
import NestedReportCardResult from "./reports/NestedReportCardResult";
import _ from 'lodash';

class CustomDashboardCache extends BaseEntity {
    static schema = {
        name: "CustomDashboardCache",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            dashboard: "Dashboard",
            updatedAt: {type: "date", optional: true},
            selectedValuesJSON: "string",
            filterApplied: "bool",
            dashboardFiltersHash: "string",
            reportCardResults: {type: "list", objectType: "ReportCardResult"},
            nestedReportCardResults: {type: "list", objectType: "NestedReportCardResult"}
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

    get dashboardFiltersHash() {
        return this.that.dashboardFiltersHash;
    }

    set dashboardFiltersHash(x) {
        this.that.dashboardFiltersHash = x;
    }

    get reportCardResults() {
        return this.toEntityList("reportCardResults", ReportCardResult);
    }

    set reportCardResults(x) {
        this.that.reportCardResults = this.fromEntityList(x);
    }

    get nestedReportCardResults() {
        return this.toEntityList("nestedReportCardResults", NestedReportCardResult);
    }

    set nestedReportCardResults(x) {
        this.that.nestedReportCardResults = this.fromEntityList(x);
    }

    static newInstance(dashboard, dashboardFiltersHash) {
        const customDashboardCache = new CustomDashboardCache();
        customDashboardCache.uuid = General.randomUUID();
        customDashboardCache.dashboard = dashboard;
        customDashboardCache.reset(dashboardFiltersHash);
        return customDashboardCache;
    }

    reset(dashboardFiltersHash) {
        this.filterApplied = false;
        this.selectedValuesJSON = JSON.stringify({});
        this.dashboardFiltersHash = dashboardFiltersHash;
        this.updatedAt = null;
        this.reportCardResults = [];
        this.nestedReportCardResults = [];
    }

    getSelectedValues() {
        return JSON.parse(this.selectedValuesJSON);
    }

    getReportCardResult(reportCard) {
        const result = this.reportCardResults.find(reportCardResult => reportCardResult.reportCard === reportCard.uuid && reportCardResult.dashboard === this.dashboard.uuid);
        if (_.isNil(result)) {
            return result;
        } else {
            result.clickable = true;
            result.hasErrorMsg = false;
            return result;
        }
    }

    getNestedReportCardResults(reportCard) {
        return this.nestedReportCardResults
            .filter(nestedReportCardResult => nestedReportCardResult.reportCard === reportCard.uuid && nestedReportCardResult.dashboard === this.dashboard.uuid)
            .map((x) => {
                x.clickable = true;
                x.hasErrorMsg = false;
                return x;
            });
    }

    clone() {
        const customDashboardCache = new CustomDashboardCache();
        customDashboardCache.uuid = this.uuid;
        customDashboardCache.dashboard = this.dashboard;
        customDashboardCache.updatedAt = this.updatedAt;
        customDashboardCache.selectedValuesJSON = this.selectedValuesJSON;
        customDashboardCache.filterApplied = this.filterApplied;
        customDashboardCache.dashboardFiltersHash = this.dashboardFiltersHash;
        customDashboardCache.reportCardResults = this.reportCardResults;
        customDashboardCache.nestedReportCardResults = this.nestedReportCardResults;
        return customDashboardCache;
    }

    matchNestedReportCardResult(nestedReportCardResult) {
        return this.nestedReportCardResults.find(x => x.reportCard === nestedReportCardResult.reportCard && x.itemKey === nestedReportCardResult.itemKey && x.dashboard === this.dashboard.uuid);
    }

    matchReportCardResult(reportCardResult) {
        return this.reportCardResults.find(x => x.reportCard === reportCardResult.reportCard && x.dashboard === this.dashboard.uuid);
    }

    isCachePopulated() {
        return _.isNil(this.updatedAt);
    }
}

export default CustomDashboardCache
