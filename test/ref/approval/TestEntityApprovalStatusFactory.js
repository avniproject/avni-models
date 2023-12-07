import General from "../../../src/utility/General";
import EntityApprovalStatus from "../../../src/EntityApprovalStatus";

class TestEntityApprovalStatusFactory {
    static create({uuid = General.randomUUID(), entityType, entityUUID, entityTypeUuid, statusDateTime = new Date(), approvalStatus}) {
        const entityApprovalStatus = new EntityApprovalStatus();
        entityApprovalStatus.uuid = uuid;
        entityApprovalStatus.entityUUID = entityUUID;
        entityApprovalStatus.entityType = entityType;
        entityApprovalStatus.entityTypeUuid = entityTypeUuid;
        entityApprovalStatus.statusDateTime = statusDateTime;
        entityApprovalStatus.approvalStatus = approvalStatus;
        return entityApprovalStatus;
    }
}

export default TestEntityApprovalStatusFactory;
