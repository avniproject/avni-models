import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import ResourceUtil from "./utility/ResourceUtil";
import ApprovalStatus from "./ApprovalStatus";
import Individual from "./Individual";
import ProgramEnrolment from "./ProgramEnrolment";
import Encounter from "./Encounter";
import ProgramEncounter from "./ProgramEncounter";
import ChecklistItem from "./ChecklistItem";

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

    get toResource() {
        const resource = _.pick(this, [
            "uuid",
            "entityType",
            "approvalStatusComment",
            "autoApproved",
            "voided"
        ]);
        resource["approvalStatusUuid"] = this.approvalStatus.uuid;
        resource["entityUuid"] = this.entityUUID;
        resource.statusDateTime = General.isoFormat(this.statusDateTime);
        return resource;
    }

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

    static getLatestApprovalStatusByEntity(entityApprovalStatuses, entityService) {
        const entityTypeToSchemaMap = {
            'Subject': Individual.schema.name,
            'ProgramEnrolment': ProgramEnrolment.schema.name,
            'Encounter': Encounter.schema.name,
            'ProgramEncounter': ProgramEncounter.schema.name,
            'ChecklistItem': ChecklistItem.schema.name
        };
        const maxEntityApprovalStatusesPerEntity = _.chain(entityApprovalStatuses)
            .filter(({voided}) => !voided)
            .groupBy(({entityType, entityUUID}) => `${entityType}(${entityUUID})`)
            .values()
            .map(groupedEntities => _.maxBy(groupedEntities, 'statusDateTime'))
            .value();
        return _.map(maxEntityApprovalStatusesPerEntity, entityApprovalStatus => {
            const schema = entityTypeToSchemaMap[entityApprovalStatus.entityType];
            const existingEntity = entityService.findByUUID(entityApprovalStatus.entityUUID, schema);
            let entity = General.pick(existingEntity, ["uuid", "latestEntityApprovalStatus"]);
            entity.latestEntityApprovalStatus = _.maxBy([entity.latestEntityApprovalStatus, entityApprovalStatus], 'statusDateTime');
            return ({schema, entity});
        });
    }

    get isPending() {
        return this.approvalStatus.isPending;
    }

    get isApproved() {
        return this.approvalStatus.isApproved;
    }

    get isRejected() {
        return this.approvalStatus.isRejected;
    }

}

export default EntityApprovalStatus;
