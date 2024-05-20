import _ from "lodash";
import {ReportCard} from "../../src";

class ReportCardFactory {
    static create({standardReportCardType}) {
        const reportCard = new ReportCard();
        reportCard.standardReportCardType = standardReportCardType;
        return reportCard;
    }
}

export default ReportCardFactory;
