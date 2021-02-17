import BaseEntity from "./BaseEntity";
import General from "./utility/General";

class StandardReportCardType extends BaseEntity {

    static schema = {
        name: "StandardReportCardType",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            name: "string",
            description: {type: "string", optional: true},
            voided: {type: "bool", default: false},
        },
    };

    static type = {
        PendingApproval: "Pending approval",
        Approved: "Approved",
        Rejected: "Rejected",
    };

    static fromResource(resource) {
        return General.assignFields(resource, new StandardReportCardType(),
            ["uuid", "name", "description", "voided"]);
    }

}

export default StandardReportCardType;
