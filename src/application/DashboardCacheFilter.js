import _ from "lodash";

function overwriteField(field, source, destination, force) {
  if (_.isNil(destination[field]) || force)
    destination[field] = source[field];
}

class DashboardCacheFilter {
  date;
  selectedPrograms;
  selectedEncounterTypes;
  selectedGeneralEncounterTypes;
  selectedCustomFilters;
  selectedGenders;
  individualFilters;
  encountersFilters;
  enrolmentFilters;
  dueChecklistFilter;
  generalEncountersFilters;
  selectedSubjectTypeUUID;
  selectedLocations;
  selectedAddressesInfo;

  static overwriteFields(from, dashboardCacheFilter, force) {
    overwriteField("date", from, dashboardCacheFilter, force);
    overwriteField("selectedPrograms", from, dashboardCacheFilter, force);
    overwriteField("selectedEncounterTypes", from, dashboardCacheFilter, force);
    overwriteField("selectedGeneralEncounterTypes", from, dashboardCacheFilter, force);
    overwriteField("selectedCustomFilters", from, dashboardCacheFilter, force);
    overwriteField("selectedGenders", from, dashboardCacheFilter, force);
    overwriteField("individualFilters", from, dashboardCacheFilter, force);
    overwriteField("encountersFilters", from, dashboardCacheFilter, force);
    overwriteField("enrolmentFilters", from, dashboardCacheFilter, force);
    overwriteField("generalEncountersFilters", from, dashboardCacheFilter, force);
    overwriteField("selectedSubjectTypeUUID", from, dashboardCacheFilter, force);
    overwriteField("dueChecklistFilter", from, dashboardCacheFilter, force);
    overwriteField("selectedLocations", from, dashboardCacheFilter, force);
    overwriteField("selectedAddressesInfo", from, dashboardCacheFilter, force);
  }

  static createEmptyInstance() {
    const dashboardCacheFilter = new DashboardCacheFilter();
    dashboardCacheFilter.selectedPrograms = [];
    dashboardCacheFilter.selectedEncounterTypes = [];
    dashboardCacheFilter.selectedGeneralEncounterTypes = [];
    dashboardCacheFilter.selectedCustomFilters = [];
    dashboardCacheFilter.selectedGenders = [];
    dashboardCacheFilter.selectedLocations = [];
    return dashboardCacheFilter;
  }
}

export default DashboardCacheFilter;
