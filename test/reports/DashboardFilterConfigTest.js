import {assert} from 'chai';
import {CustomFilter, DashboardFilterConfig} from "../../src";
import SubjectTypeFactory from "../ref/SubjectTypeFactory";
import TestConceptFactory from "../ref/TestConceptFactory";

describe('DashboardFilterConfigTest', () => {
  it('is valid', () => {
    const dashboardFilterConfig = new DashboardFilterConfig();
    dashboardFilterConfig.setType(CustomFilter.type.Concept);
    dashboardFilterConfig.observationBasedFilter.concept = TestConceptFactory.create({uuid: "C1"});
    dashboardFilterConfig.observationBasedFilter.setScope(CustomFilter.scope.Registration);
    assert.equal(dashboardFilterConfig.isValid(), true);
  });
});
