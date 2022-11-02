import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import ResourceUtil from "./utility/ResourceUtil";
import ApprovalStatus from "./ApprovalStatus";
import _ from 'lodash';
import SchemaNames from "./SchemaNames";

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

  constructor(that = null) {
    super(that);
  }

  get entityUUID() {
    return this.that.entityUUID;
  }

  set entityUUID(x) {
    this.that.entityUUID = x;
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
    this.that.approvalStatus = this.toObject(x);
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

  static getLatestApprovalStatusByEntity(entityApprovalStatuses, entityService) {
    const getSchema = (passedEntityType) => _.get(_.find(EntityApprovalStatus.getSchemaEntityTypeList(), ({entityType}) => entityType === passedEntityType), 'schema');
    const maxEntityApprovalStatusesPerEntity = _.chain(entityApprovalStatuses)
      .filter(({
                 entityType,
                 entityUUID
               }) => !_.isEmpty(entityService.findByUUID(entityUUID, getSchema(entityType))))
      .groupBy(({entityType, entityUUID}) => `${entityType}(${entityUUID})`)
      .values()
      .map(groupedEntities => _.maxBy(groupedEntities, 'statusDateTime'))
      .value();
    return _.map(maxEntityApprovalStatusesPerEntity, entityApprovalStatus => {
      const schema = getSchema(entityApprovalStatus.entityType);
      const existingEntity = entityService.findByUUID(entityApprovalStatus.entityUUID, schema);
      let entity = General.pick(existingEntity, ["uuid", "latestEntityApprovalStatus"]);
      entity.latestEntityApprovalStatus = _.maxBy([entity.latestEntityApprovalStatus, entityApprovalStatus], 'statusDateTime');
      return ({schema, entity});
    });
  }

}

export default EntityApprovalStatus;
