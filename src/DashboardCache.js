import _ from 'lodash';
import BaseEntity from "./BaseEntity";

class DashboardCache extends BaseEntity{

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

  static create(updatedAt, cardJSON, filterJSON) {
    const dashboardCache = new DashboardCache();
    dashboardCache.uuid = this.rowUUID;
    dashboardCache.updatedAt = updatedAt;
    dashboardCache.cardJSON = cardJSON;
    dashboardCache.filterJSON = filterJSON;
    return dashboardCache;
  }

  static getFilterJSONFromState(state) {
    const filterCache = {
      date: state.date,
      selectedPrograms: state.selectedPrograms,
      selectedEncounterTypes: state.selectedEncounterTypes,
      selectedGeneralEncounterTypes: state.selectedGeneralEncounterTypes,
      selectedCustomFilters: state.selectedCustomFilters,
      selectedGenders: state.selectedGenders,
      programs: state.programs,
      individualFilters: state.individualFilters,
      encountersFilters: state.encountersFilters,
      enrolmentFilters: state.enrolmentFilters,
      generalEncountersFilters: state.generalEncountersFilters,
      selectedSubjectType: state.subjectType
    };
    return state.subjectType && _.isEmpty(state.subjectType.name) ? _.omit(filterCache, ['selectedSubjectType']) : filterCache;
  }

  static createEmptyInstance() {
    return new DashboardCache();
  }

  getCardJSON() {
    return this.cardJSON && JSON.parse(this.cardJSON) || {};
  }

  getFilterJSON() {
    return this.filterJSON && JSON.parse(this.filterJSON) || {};
  }
}

export default DashboardCache
