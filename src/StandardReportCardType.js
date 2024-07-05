import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import TaskType from "./task/TaskType";
import ApprovalStatus from "./ApprovalStatus";
import _ from "lodash";
import Duration from "./Duration";

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

    constructor(that = null) {
        super(that);
    }

    get name() {
        return this.that.name;
    }

    set name(x) {
        this.that.name = x;
    }

    get description() {
        return this.that.description;
    }

    set description(x) {
        this.that.description = x;
    }

    static type = {
        PendingApproval: "Pending approval",
        Approved: "Approved",
        Rejected: "Rejected",
        ScheduledVisits: "Scheduled visits",
        OverdueVisits: "Overdue visits",
        RecentRegistrations: "Recent registrations",
        RecentEnrolments: "Recent enrolments",
        RecentVisits: "Recent visits",
        Total: "Total",
        Comments: "Comments",
        CallTasks: "Call tasks",
        OpenSubjectTasks: "Open subject tasks",
        DueChecklist: "Due checklist"
    };

    static recentCardDurationUnits = [
        Duration.Day,
        Duration.Week,
        Duration.Month
    ]

    get iconName() {
        const typeIcon = {
            [StandardReportCardType.type.Approved]: 'check-circle',
            [StandardReportCardType.type.Rejected]: 'cancel',
            [StandardReportCardType.type.PendingApproval]: 'av-timer',
            [StandardReportCardType.type.Comments]: 'message',
            [StandardReportCardType.type.CallTasks]: 'call',
            [StandardReportCardType.type.OpenSubjectTasks]: 'sticky-note-2',
        };
        return typeIcon[this.name];
    }

    get cardColor() {
        const typeCardColor = {
            [StandardReportCardType.type.Approved]: '#00897b',
            [StandardReportCardType.type.Rejected]: '#bf360c',
            [StandardReportCardType.type.PendingApproval]: '#6a1b9a',
            [StandardReportCardType.type.Comments]: '#3949ab',
            [StandardReportCardType.type.CallTasks]: '#69a672',
            [StandardReportCardType.type.OpenSubjectTasks]: '#717cac',
        };
        return typeCardColor[this.name];
    }

    get textColor() {
        return this.isStandardCard() ? '#ffffff' : 'rgba(0, 0, 0, 0.87)'
    }

    static fromResource(resource) {
        return General.assignFields(resource, new StandardReportCardType(),
            ["uuid", "name", "description", "voided"]);
    }

    isStandardCard() {
        return _.includes([...this.approvalTypes(), StandardReportCardType.type.Comments, StandardReportCardType.type.CallTasks, StandardReportCardType.type.OpenSubjectTasks], this.name);
    }

    approvalTypes() {
        return [StandardReportCardType.type.PendingApproval, StandardReportCardType.type.Approved, StandardReportCardType.type.Rejected]
    }

    defaultTypes() {
        return [StandardReportCardType.type.ScheduledVisits, StandardReportCardType.type.OverdueVisits, StandardReportCardType.type.RecentRegistrations, StandardReportCardType.type.RecentEnrolments, StandardReportCardType.type.RecentVisits, StandardReportCardType.type.Total]
    }

    isApprovalType() {
        return _.includes(this.approvalTypes(), this.name);
    }

    isCommentType() {
        return this.name === StandardReportCardType.type.Comments;
    }

    isTaskType() {
        return _.includes([StandardReportCardType.type.CallTasks, StandardReportCardType.type.OpenSubjectTasks], this.name);
    }

    isChecklistType() {
        return this.name === StandardReportCardType.type.DueChecklist;
    }

    getTaskTypeType() {
        switch (this.name) {
            case StandardReportCardType.type.CallTasks:
                return TaskType.TaskTypeName.Call;
            case StandardReportCardType.type.OpenSubjectTasks:
                return TaskType.TaskTypeName.OpenSubject;
        }
    }

    isDefaultType() {
        return _.includes(this.defaultTypes(), this.name);
    }

    getApprovalStatusForType() {
        return typeToStatusMap[this.name];
    }

    isSubjectTypeFilterSupported() {
        return [
            StandardReportCardType.type.ScheduledVisits,
            StandardReportCardType.type.OverdueVisits,
            StandardReportCardType.type.RecentRegistrations,
            StandardReportCardType.type.RecentEnrolments,
            StandardReportCardType.type.RecentVisits,
            StandardReportCardType.type.Total,
        ].includes(this.name);
    }

    isRecentType() {
        return [
            StandardReportCardType.type.RecentRegistrations,
            StandardReportCardType.type.RecentEnrolments,
            StandardReportCardType.type.RecentVisits,
        ].includes(this.name);
    }
}

const typeToStatusMap = {
    [StandardReportCardType.type.PendingApproval]: ApprovalStatus.statuses.Pending,
    [StandardReportCardType.type.Approved]: ApprovalStatus.statuses.Approved,
    [StandardReportCardType.type.Rejected]: ApprovalStatus.statuses.Rejected,
};

export default StandardReportCardType;
