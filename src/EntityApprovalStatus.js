import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import ResourceUtil from "./utility/ResourceUtil";
import ApprovalStatus from "./ApprovalStatus";

class EntityApprovalStatus extends BaseEntity {

    static schema = {
        name: "EntityApprovalStatus",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            entityUUID: "string",
            entityType: "string",
            approvalStatus: "ApprovalStatus",
            approvalStatusComment: {type: "string", optional: true},
            statusDateTime: "date",
            autoApproved: {type: "bool", default: false},
            voided: {type: "bool", default: false},
        },
    };
    static entityType = {
        Subject: "Subject",
        ProgramEnrolment: "ProgramEnrolment",
        ProgramEncounter: "ProgramEncounter",
        Encounter: "Encounter",
        ChecklistItem: "ChecklistItem",
    };
    uuid;

    static fromResource(resource, entityService) {
        const entityApprovalStatus = General.assignFields(resource, new EntityApprovalStatus(),
            ["uuid", "entityType", "approvalStatusComment", "autoApproved", "voided"],
            ["statusDateTime"]);
        entityApprovalStatus.approvalStatus = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "approvalStatusUUID"),
            ApprovalStatus.schema.name
        );
        entityApprovalStatus.entityUUID = ResourceUtil.getUUIDFor(resource, "entityUUID");
        return entityApprovalStatus;
    }

    static create(entityUUID, entityType, approvalStatus, approvalStatusComment, autoApproved) {
        const entityApprovalStatus = new EntityApprovalStatus();
        entityApprovalStatus.uuid = General.randomUUID();
        entityApprovalStatus.entityUUID = entityUUID;
        entityApprovalStatus.entityType = entityType;
        entityApprovalStatus.approvalStatus = approvalStatus;
        entityApprovalStatus.approvalStatusComment = approvalStatusComment;
        entityApprovalStatus.autoApproved = autoApproved;
        entityApprovalStatus.statusDateTime = new Date();
        return entityApprovalStatus;
    }

}

export default EntityApprovalStatus;
