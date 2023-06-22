import BaseEntity from "./BaseEntity";
import ParseUtil from './utility/ParseUtil';

class CustomDashboardCache extends BaseEntity{

  static schema = {
    name: "CustomDashboardCache",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      checksum: "string",
      updatedAt: "date",
      selectedValuesJSON: "string",
      filterApplied: {type: "bool", default: false},
      filterErrorsJSON: "string",
      ruleInputJSON: "string",
      transformedFiltersJSON: "string",
    },
  };

  constructor(that = null) {
    super(that);
  }

  get checksum() {
    return this.that.checksum;
  }

  set checksum(x) {
    this.that.checksum = x;
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

  get ruleInputJSON() {
    return this.that.ruleInputJSON;
  }

  set ruleInputJSON(x) {
    this.that.ruleInputJSON = x;
  }

  get transformedFiltersJSON() {
    return this.that.transformedFiltersJSON;
  }

  set transformedFiltersJSON(x) {
    this.that.transformedFiltersJSON = x;
  }

  static create(uuid, checksum, updatedAt, selectedValuesJSON, filterApplied, filterErrorsJSON, ruleInputJSON, transformedFiltersJSON) {
    const customDashboardCache = new CustomDashboardCache();
    customDashboardCache.uuid = uuid;
    customDashboardCache.checksum = checksum;
    customDashboardCache.updatedAt = updatedAt;
    customDashboardCache.selectedValuesJSON = selectedValuesJSON;
    customDashboardCache.filterApplied = filterApplied;
    customDashboardCache.filterErrorsJSON = filterErrorsJSON;
    customDashboardCache.ruleInputJSON = ruleInputJSON;
    customDashboardCache.transformedFiltersJSON = transformedFiltersJSON;
    return customDashboardCache;
  }

  static getSelectedValuesFromState(state) {
    const filterCache = {
      date: state.date,
      applied: false,
      selectedLocations: state.selectedLocations,
      selectedCustomFilters: state.selectedCustomFilters,
      selectedGenders: state.selectedGenders,
    };
    return filterCache;
  }

  static createEmptyInstance() {
    return new CustomDashboardCache();
  }

  getChecksum() {
    return this.checksum;
  }

  getSelectedValues() {
    return this.selectedValuesJSON && ParseUtil.parse(this.selectedValuesJSON) || {};
  }

  getFilterErrors() {
    return this.filterErrorsJSON && ParseUtil.parse(this.filterErrorsJSON) || {};
  }

  getRuleInput() {
    return this.ruleInputJSON && ParseUtil.parse(this.ruleInputJSON) || {ruleInputArray: null};
  }

  getTransformedFilters() {
    return this.transformedFiltersJSON && ParseUtil.parse(this.transformedFiltersJSON) || {
      date: new Date(),
      applied: false,
      selectedLocations: [],
      selectedCustomFilters: [],
      selectedGenders: [],
    };
  }
}

export default CustomDashboardCache
