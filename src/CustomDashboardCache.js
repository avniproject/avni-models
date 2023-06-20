import BaseEntity from "./BaseEntity";

class CustomDashboardCache extends BaseEntity{

  static schema = {
    name: "CustomDashboardCache",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      updatedAt: "date",
      selectedValuesJSON: "string",
      filterApplied: {type: "bool", default: false},
      filterErrorsJSON: "string",
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

  get filterErrorsJSON() {
    return this.that.filterErrorsJSON;
  }

  set filterErrorsJSON(x) {
    this.that.filterErrorsJSON = x;
  }

  static create(uuid, updatedAt, selectedValuesJSON, filterApplied, filterErrorsJSON) {
    const customDashboardCache = new CustomDashboardCache();
    customDashboardCache.uuid = uuid;
    customDashboardCache.updatedAt = updatedAt;
    customDashboardCache.selectedValuesJSON = selectedValuesJSON;
    customDashboardCache.filterApplied = filterApplied;
    customDashboardCache.filterErrorsJSON = filterErrorsJSON;
    return customDashboardCache;
  }

  static getSelectedValuesFromState(state) {
    const filterCache = {
      date: state.date,
      selectedLocations: state.selectedLocations,
      selectedCustomFilters: state.selectedCustomFilters,
      selectedGenders: state.selectedGenders,
    };
    return filterCache;
  }

  static createEmptyInstance() {
    return new CustomDashboardCache();
  }

  getSelectedValues() {
    return this.selectedValuesJSON && JSON.parse(this.selectedValuesJSON) || {};
  }

  getFilterErrors() {
    return this.filterErrorsJSON && JSON.parse(this.filterErrorsJSON) || {};
  }
}

export default CustomDashboardCache
