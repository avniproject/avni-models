import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import ResourceUtil from "./utility/ResourceUtil";
import StandardReportCardType from "./StandardReportCardType";

class ReportCard extends BaseEntity {

    static schema = {
        name: "ReportCard",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            name: "string",
            query: {type: "string", optional: true},
            description: {type: "string", optional: true},
            standardReportCardType: {type: "StandardReportCardType", option: true},
            colour: "string",
            voided: {type: "bool", default: false},
        },
    };

    static fromResource(resource, entityService) {
        const reportCard = General.assignFields(resource, new ReportCard(),
            ["uuid", "name", "query", "description", "colour", "voided"]);
        reportCard.standardReportCardType = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "standardReportCardUUID"),
            StandardReportCardType.schema.name
        );
        return reportCard;
    }

}

export default ReportCard;
