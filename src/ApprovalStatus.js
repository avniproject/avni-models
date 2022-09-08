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

  mapNonPrimitives(realmObject, entityMapper) {
  }

    static statuses = {
        Pending: "Pending",
        Approved: "Approved",
        Rejected: "Rejected",
    };

    get isPending() {
        return this.status === ApprovalStatus.statuses.Pending
    }

    get isApproved() {
        return this.status === ApprovalStatus.statuses.Approved
    }

    get isRejected() {
        return this.status === ApprovalStatus.statuses.Rejected
    }

    static fromResource(resource) {
        return General.assignFields(resource, new ApprovalStatus(),
            ["uuid", "status", "voided"]);
    }
}

export default ApprovalStatus;
