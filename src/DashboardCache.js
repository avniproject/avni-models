import BaseEntity from "./BaseEntity";
import DashboardCacheFilter from "./application/DashboardCacheFilter";

class DashboardCache extends BaseEntity {
  static rowUUID = '176d5284-7927-422e-909a-a546f5001c84';

  static schema = {
    name: "DashboardCache",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      updatedAt: "date",
      cardJSON: "string",
      filterJSON: "string",
    },
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

  get cardJSON() {
    return this.that.cardJSON;
  }

  set cardJSON(x) {
    this.that.cardJSON = x;
  }

  get filterJSON() {
    return this.that.filterJSON;
  }

  set filterJSON(x) {
    this.that.filterJSON = x;
  }

  static createEmptyInstance() {
    const dashboardCache = new DashboardCache();
    dashboardCache.uuid = this.rowUUID;
    dashboardCache.filterJSON =  JSON.stringify(DashboardCacheFilter.createEmptyInstance());
    dashboardCache.cardJSON = "{}";
    dashboardCache.updatedAt = new Date();
    return dashboardCache;
  }

  getCard() {
    return this.cardJSON && JSON.parse(this.cardJSON) || {};
  }

  getFilter() {
    return this.filterJSON && JSON.parse(this.filterJSON) || {};
  }

  setFilter(value) {
    this.filterJSON = JSON.stringify(value);
  }

  setCard(value) {
    this.cardJSON = JSON.stringify(value);
  }
}

export default DashboardCache
