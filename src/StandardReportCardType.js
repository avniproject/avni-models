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
            type: {type: "string"},
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

    get type() {
        return this.that.type;
    }

    set type(x) {
        this.that.type = x;
    }

    static types = {
        PendingApproval: "PendingApproval",
        Approved: "Approved",
        Rejected: "Rejected",
        ScheduledVisits: "ScheduledVisits",
        OverdueVisits: "OverdueVisits",
        RecentRegistrations: "RecentRegistrations",
        RecentEnrolments: "RecentEnrolments",
        RecentVisits: "RecentVisits",
        Total: "Total",
        Comments: "Comments",
        CallTasks: "CallTasks",
        OpenSubjectTasks: "OpenSubjectTasks",
        DueChecklist: "DueChecklist"
    };

    static recentCardDurationUnits = [
        Duration.Day,
        Duration.Week,
        Duration.Month
    ]

    get iconName() {
        const typeIcon = {
            [StandardReportCardType.types.Approved]: 'check-circle',
            [StandardReportCardType.types.Rejected]: 'cancel',
            [StandardReportCardType.types.PendingApproval]: 'av-timer',
            [StandardReportCardType.types.Comments]: 'message',
            [StandardReportCardType.types.CallTasks]: 'call',
            [StandardReportCardType.types.OpenSubjectTasks]: 'sticky-note-2',
        };
        return typeIcon[this.type];
    }

    get cardColor() {
        const typeCardColor = {
            [StandardReportCardType.types.Approved]: '#00897b',
            [StandardReportCardType.types.Rejected]: '#bf360c',
            [StandardReportCardType.types.PendingApproval]: '#6a1b9a',
            [StandardReportCardType.types.Comments]: '#3949ab',
            [StandardReportCardType.types.CallTasks]: '#69a672',
            [StandardReportCardType.types.OpenSubjectTasks]: '#717cac',
        };
        return typeCardColor[this.type];
    }

    get textColor() {
        return this.isStandardCard() ? '#ffffff' : 'rgba(0, 0, 0, 0.87)'
    }

    static fromResource(resource) {
        return General.assignFields(resource, new StandardReportCardType(),
            ["uuid", "name", "description", "voided", "type"]);
    }

    isStandardCard() {
        return _.includes([...this.approvalTypes(), StandardReportCardType.types.Comments, StandardReportCardType.types.CallTasks, StandardReportCardType.types.OpenSubjectTasks], this.type);
    }

    approvalTypes() {
        return [StandardReportCardType.types.PendingApproval, StandardReportCardType.types.Approved, StandardReportCardType.types.Rejected]
    }

    defaultTypes() {
        return [StandardReportCardType.types.ScheduledVisits, StandardReportCardType.types.OverdueVisits, StandardReportCardType.types.RecentRegistrations, StandardReportCardType.types.RecentEnrolments, StandardReportCardType.types.RecentVisits, StandardReportCardType.types.Total]
    }

    isApprovalType() {
        return _.includes(this.approvalTypes(), this.type);
    }

    isCommentType() {
        return this.type === StandardReportCardType.types.Comments;
    }

    isTaskType() {
        return _.includes([StandardReportCardType.types.CallTasks, StandardReportCardType.types.OpenSubjectTasks], this.type);
    }

    isChecklistType() {
        return this.type === StandardReportCardType.types.DueChecklist;
    }

    getTaskTypeType() {
        switch (this.type) {
            case StandardReportCardType.types.CallTasks:
                return TaskType.TaskTypeName.Call;
            case StandardReportCardType.types.OpenSubjectTasks:
                return TaskType.TaskTypeName.OpenSubject;
        }
    }

    isDefaultType() {
        return _.includes(this.defaultTypes(), this.type);
    }

    getApprovalStatusForType() {
        return typeToStatusMap[this.type];
    }

    isSubjectTypeFilterSupported() {
        return [
            StandardReportCardType.types.ScheduledVisits,
            StandardReportCardType.types.OverdueVisits,
            StandardReportCardType.types.RecentRegistrations,
            StandardReportCardType.types.RecentEnrolments,
            StandardReportCardType.types.RecentVisits,
            StandardReportCardType.types.Total,
        ].includes(this.type);
    }

    isRecentType() {
        return [
            StandardReportCardType.types.RecentRegistrations,
            StandardReportCardType.types.RecentEnrolments,
            StandardReportCardType.types.RecentVisits,
        ].includes(this.type);
    }
}

const typeToStatusMap = {
    [StandardReportCardType.types.PendingApproval]: ApprovalStatus.statuses.Pending,
    [StandardReportCardType.types.Approved]: ApprovalStatus.statuses.Approved,
    [StandardReportCardType.types.Rejected]: ApprovalStatus.statuses.Rejected,
};

export default StandardReportCardType;
