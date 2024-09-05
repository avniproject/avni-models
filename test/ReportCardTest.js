import ReportCardFactory from "./ref/ReportCardFactory";
import StandardReportCardTypeFactory from "./ref/StandardReportCardTypeFactory";
import StandardReportCardType from "../src/StandardReportCardType";
import {assert} from 'chai';

it('is subject type filter supported', function () {
    const approvedType = StandardReportCardTypeFactory.create({name: 'Approved', type: StandardReportCardType.types.Approved});
    const reportCard = ReportCardFactory.create({standardReportCardType: approvedType});
    assert.equal(reportCard.isSubjectTypeFilterSupported(), false);
    reportCard.standardReportCardType = StandardReportCardTypeFactory.create({name: 'Scheduled visits', type: StandardReportCardType.types.ScheduledVisits});
    assert.equal(reportCard.isSubjectTypeFilterSupported(), true);
});
