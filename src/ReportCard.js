import BaseEntity from "./BaseEntity";
import General from "./utility/General";

class ReportCard extends BaseEntity {

    static schema = {
        name: "ReportCard",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            name: "string",
            query: "string",
            description: "string",
            colour: "string",
            voided: {type: "bool", default: false},
        },
    };

    static fromResource(resource) {
        return General.assignFields(resource, new ReportCard(),
            ["uuid", "name", "query", "description", "colour", "voided"]);
    }

}

export default ReportCard;
