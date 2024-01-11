import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import ResourceUtil from "./utility/ResourceUtil";
import ApprovalStatus from "./ApprovalStatus";
import _ from 'lodash';
import SchemaNames from "./SchemaNames";

function getMatchingApprovalStatusEntities(entities, approvalStatus_status) {
    return entities.filter((x) => !_.isNil(x.latestEntityApprovalStatus) && x.latestEntityApprovalStatus.hasStatus(approvalStatus_status));
}

class EntityApprovalStatus extends BaseEntity {
    static schema = {
        name: SchemaNames.EntityApprovalStatus,
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            entityUUID: "string",
            approvalStatus: "ApprovalStatus",
            entityType: "string",
            entityTypeUuid: {type: "string", optional: true},
            approvalStatusComment: {type: "string", optional: true},
            statusDateTime: "date",
            autoApproved: {type: "bool", default: false},
            voided: {type: "bool", default: false}
        },
    };

    static entityType = {
        Subject: "Subject",
        ProgramEnrolment: "ProgramEnrolment",
        ProgramEncounter: "ProgramEncounter",
        Encounter: "Encounter",
        ChecklistItem: "ChecklistItem",
    };

    static addMatchingApprovalStatusEntity(entities, approvalStatus_status, list, groupingByPath) {
        Object.values(_.groupBy(entities, (x) => _.get(x, groupingByPath))).forEach((y) => {
            const latestEntitiesOfSameType = getMatchingApprovalStatusEntities(y, approvalStatus_status);
            list.push(...latestEntitiesOfSameType.map((x) => _.identity(x)));
        })
    }

    static getApprovalEntitiesSchema() {
        return [
            SchemaNames.Individual,
            SchemaNames.ProgramEncounter,
            SchemaNames.Encounter,
            SchemaNames.ProgramEnrolment,
            SchemaNames.ChecklistItem
        ]
    }

    getApprovedEntitySchema() {
        if (this.entityType === EntityApprovalStatus.entityType.Subject) return SchemaNames.Individual;
        return SchemaNames[this.entityType];
    }

    constructor(that = null) {
        super(that);
    }

    get entityUUID() {
        return this.that.entityUUID;
    }

    set entityUUID(x) {
        this.that.entityUUID = x;
    }

    get entityTypeUuid() {
        return this.that.entityTypeUuid;
    }

    set entityTypeUuid(x) {
        this.that.entityTypeUuid = x;
    }

    get entityType() {
        return this.that.entityType;
    }

    set entityType(x) {
        this.that.entityType = x;
    }

    get approvalStatus() {
        return this.toEntity("approvalStatus", ApprovalStatus);
    }

    set approvalStatus(x) {
        this.that.approvalStatus = this.fromObject(x);
    }

    get approvalStatusComment() {
        return this.that.approvalStatusComment;
    }

    set approvalStatusComment(x) {
        this.that.approvalStatusComment = x;
    }

    get statusDateTime() {
        return this.that.statusDateTime;
    }

    set statusDateTime(x) {
        this.that.statusDateTime = x;
    }

    get autoApproved() {
        return this.that.autoApproved;
    }

    set autoApproved(x) {
        this.that.autoApproved = x;
    }

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
        resource["entityTypeUuid"] = this.entityTypeUuid;
        resource.statusDateTime = General.isoFormat(this.statusDateTime);
        return resource;
    }

    static fromResource(resource, entityService) {
        const entityApprovalStatus = General.assignFields(resource, new EntityApprovalStatus(),
            ["uuid", "entityType", "approvalStatusComment", "autoApproved", "voided", "entityTypeUuid"],
            ["statusDateTime"]);
        entityApprovalStatus.approvalStatus = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "approvalStatusUUID"),
            ApprovalStatus.schema.name
        );
        entityApprovalStatus.entityUUID = ResourceUtil.getUUIDFor(resource, "entityUUID");
        return entityApprovalStatus;
    }

    static create(entityUUID, entityType, approvalStatus, approvalStatusComment, autoApproved, entityTypeUuid) {
        const entityApprovalStatus = new EntityApprovalStatus();
        entityApprovalStatus.uuid = General.randomUUID();
        entityApprovalStatus.entityUUID = entityUUID;
        entityApprovalStatus.entityTypeUuid = entityTypeUuid;
        entityApprovalStatus.entityType = entityType;
        entityApprovalStatus.approvalStatus = approvalStatus;
        entityApprovalStatus.approvalStatusComment = approvalStatusComment;
        entityApprovalStatus.autoApproved = autoApproved;
        entityApprovalStatus.statusDateTime = new Date();
        return entityApprovalStatus;
    }

    static getSchemaEntityTypeList() {
        return [
            {schema: SchemaNames.Individual, entityType: EntityApprovalStatus.entityType.Subject},
            {
                schema: SchemaNames.ProgramEnrolment,
                entityType: EntityApprovalStatus.entityType.ProgramEnrolment
            },
            {schema: SchemaNames.Encounter, entityType: EntityApprovalStatus.entityType.Encounter},
            {
                schema: SchemaNames.ProgramEncounter,
                entityType: EntityApprovalStatus.entityType.ProgramEncounter
            },
            {
                schema: SchemaNames.ChecklistItem,
                entityType: EntityApprovalStatus.entityType.ChecklistItem
            }
        ];
    }

    hasStatus(status) {
        return this.approvalStatus.status === status;
    }

    get isRejected() {
        return this.approvalStatus.isRejected;
    }

    get isApproved() {
        return this.approvalStatus.isApproved;
    }

    get isPending() {
        return this.approvalStatus.isPending;
    }
}

export default EntityApprovalStatus;
