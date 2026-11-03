import {assert} from 'chai';
import CustomFilter from "../src/CustomFilter";

describe('CustomFilterTest', () => {
    it('offers Program as a search filter type', () => {
        assert.equal(CustomFilter.type.Program, "Program");
    });

    it('does not offer Program as a dashboard filter type', () => {
        const dashboardTypes = CustomFilter.getDashboardFilterTypes();
        assert.isUndefined(dashboardTypes.Program);
        assert.isUndefined(dashboardTypes.Name);
        assert.equal(dashboardTypes.Gender, "Gender");
        assert.equal(CustomFilter.type.Program, "Program", "getDashboardFilterTypes must not change CustomFilter.type");
    });
});
