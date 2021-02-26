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

    get iconName() {
        const typeIcon = {
            [StandardReportCardType.type.Approved]: 'check-circle',
            [StandardReportCardType.type.Rejected]: 'cancel',
            [StandardReportCardType.type.PendingApproval]: 'av-timer',
        };
        return typeIcon[this.name];
    }

    get cardColor() {
        const typeCardColor = {
            [StandardReportCardType.type.Approved]: '#00897b',
            [StandardReportCardType.type.Rejected]: '#bf360c',
            [StandardReportCardType.type.PendingApproval]: '#6a1b9a',
        };
        return typeCardColor[this.name];
    }

    get textColor() {
        return this.isApprovalType() ? '#ffffff' : 'rgba(0, 0, 0, 0.87)'
    }

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
