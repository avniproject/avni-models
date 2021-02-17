import BaseEntity from "./BaseEntity";
import General from "./utility/General";

class ApprovalStatus extends BaseEntity {

    static schema = {
        name: "ApprovalStatus",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            status: "string",
            voided: {type: "bool", default: false},
        },
    };

    static status = {
        Pending: "Pending",
        Approved: "Approved",
        Rejected: "Rejected",
    };

    static fromResource(resource) {
        return General.assignFields(resource, new ApprovalStatus(),
            ["uuid", "status", "voided"]);
    }

}

export default ApprovalStatus;
