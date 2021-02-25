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
        ScheduledVisits: "Scheduled visits",
        OverdueVisits: "Overdue visits",
        LatestRegistrations: "Last 24 hours registrations",
        LatestEnrolments: "Last 24 hours enrolments",
        LatestVisits: "Last 24 hours visits",
        Total: "Total"
    };

    static fromResource(resource) {
        return General.assignFields(resource, new StandardReportCardType(),
            ["uuid", "name", "description", "voided"]);
    }

    approvalTypes() {
        return [StandardReportCardType.type.PendingApproval, StandardReportCardType.type.Approved, StandardReportCardType.type.Rejected]
    }

    defaultTypes() {
        return [StandardReportCardType.type.ScheduledVisits, StandardReportCardType.type.OverdueVisits, StandardReportCardType.type.LatestRegistrations, StandardReportCardType.type.LatestEnrolments, StandardReportCardType.type.LatestVisits, StandardReportCardType.type.Total]
    }

    isApprovalType() {
        return _.includes(this.approvalTypes(), this.name);
    }

    isDefaultType() {
        return _.includes(this.defaultTypes(), this.name);
    }

}

export default StandardReportCardType;
