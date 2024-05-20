import ReportCardFactory from "./ref/ReportCardFactory";
import StandardReportCardTypeFactory from "./ref/StandardReportCardTypeFactory";
import StandardReportCardType from "../src/StandardReportCardType";
import {assert} from 'chai';

it('is subject type filter supported', function () {
    const approvedType = StandardReportCardTypeFactory.create({name: StandardReportCardType.type.Approved});
    const reportCard = ReportCardFactory.create({standardReportCardType: approvedType});
    assert.equal(reportCard.isSubjectTypeFilterSupported(), false);
    reportCard.standardReportCardType = StandardReportCardTypeFactory.create({name: StandardReportCardType.type.ScheduledVisits});
    assert.equal(reportCard.isSubjectTypeFilterSupported(), true);
});
