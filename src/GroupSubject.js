import BaseEntity from "./BaseEntity";
import _ from "lodash";
import Individual from "./Individual";
import ResourceUtil from "./utility/ResourceUtil";
import General from "./utility/General";
import GroupRole from "./GroupRole";
import {AuditFields, mapAuditFields} from "./utility/AuditUtil";

class GroupSubject extends BaseEntity {

    static EXPLICIT_ERROR_CODE_KEY_FOR_MISSING_MEMBER = 'GroupSubjectMapping-MemberSubject-Association';
    static schema = {
        name: "GroupSubject",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            groupSubject: { type: 'object', objectType: 'Individual' },
            memberSubject: { type: 'object', objectType: 'Individual' },
            groupRole: { type: 'object', objectType: 'GroupRole' },
            membershipStartDate: "date",
            membershipEndDate: {type: "date", optional: true},
            voided: {type: "bool", default: false},
            ...AuditFields
        },
    };

    constructor(that = null) {
        super(that);
    }

    get groupSubject() {
        return this.toEntity("groupSubject", Individual);
    }

    set groupSubject(x) {
        this.that.groupSubject = this.fromObject(x);
    }

    get memberSubject() {
        return this.toEntity("memberSubject", Individual);
    }

    set memberSubject(x) {
        this.that.memberSubject = this.fromObject(x);
    }

    get groupRole() {
        return this.toEntity("groupRole", GroupRole);
    }

    set groupRole(x) {
        this.that.groupRole = this.fromObject(x);
    }

    get membershipStartDate() {
        return this.that.membershipStartDate;
    }

    set membershipStartDate(x) {
        this.that.membershipStartDate = x;
    }

    get membershipEndDate() {
        return this.that.membershipEndDate;
    }

    set membershipEndDate(x) {
        this.that.membershipEndDate = x;
    }

    get createdBy() {
        return this.that.createdBy;
    }

    set createdBy(x) {
        this.that.createdBy = x;
    }

    get lastModifiedBy() {
        return this.that.lastModifiedBy;
    }

    set lastModifiedBy(x) {
        this.that.lastModifiedBy = x;
    }

    get createdByUUID() {
        return this.that.createdByUUID;
    }

    set createdByUUID(x) {
        this.that.createdByUUID = x;
    }

    get lastModifiedByUUID() {
        return this.that.lastModifiedByUUID;
    }

    set lastModifiedByUUID(x) {
        this.that.lastModifiedByUUID = x;
    }

    get toResource() {
        const resource = _.pick(this, ["uuid"]);
        resource.groupSubjectUUID = this.groupSubject.uuid;
        resource.memberSubjectUUID = this.memberSubject.uuid;
        resource.groupRoleUUID = this.groupRole.uuid;
        resource.membershipStartDate = this.membershipStartDate;
        resource.membershipEndDate = this.membershipEndDate;
        resource.voided = this.voided;
        return resource;
    }

    static createEmptyInstance(uuid) {
        const groupSubjectEntity = new GroupSubject();
        groupSubjectEntity.uuid = uuid || General.randomUUID();
        groupSubjectEntity.groupSubject = Individual.createEmptyInstance();
        groupSubjectEntity.memberSubject = Individual.createEmptyInstance();
        groupSubjectEntity.groupRole = GroupRole.createEmptyInstance();
        return groupSubjectEntity;
    }

    static create({
                      uuid,
                      groupSubject,
                      memberSubject,
                      groupRole,
                      membershipStartDate,
                      membershipEndDate,
                  }) {
        const groupSubjectEntity = GroupSubject.createEmptyInstance(uuid);
        groupSubjectEntity.groupSubject = groupSubject;
        groupSubjectEntity.memberSubject = memberSubject;
        groupSubjectEntity.groupRole = groupRole;
        groupSubjectEntity.membershipStartDate = membershipStartDate.value;
        groupSubjectEntity.membershipEndDate = membershipEndDate.value;
        return groupSubjectEntity;
    }

    static fromResource(resource, entityService) {
        const childResource = resource;
        const childEntityClass = GroupSubject;
        const parentSchema = Individual.schema.name;
        const groupSubjectParentIdField = "groupSubjectUUID";
        const memberSubjectParentIdField = "memberSubjectUUID";

        const groupOrHouseholdSubject = BaseEntity.getParentEntity(
            entityService,
            childEntityClass,
            childResource,
            groupSubjectParentIdField,
            parentSchema
        );
        const memberSubject = BaseEntity.getParentEntity(
            entityService,
            childEntityClass,
            childResource,
            memberSubjectParentIdField,
            parentSchema,
            true,
            GroupSubject.EXPLICIT_ERROR_CODE_KEY_FOR_MISSING_MEMBER
        );
        const groupRole = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "groupRoleUUID"),
            GroupRole.schema.name
        );
        const groupSubjectEntity = General.assignFields(
            resource,
            new GroupSubject(),
            ["uuid", "voided"],
            ["membershipStartDate", "membershipEndDate"]
        );
        groupSubjectEntity.groupSubject = groupOrHouseholdSubject;
        groupSubjectEntity.memberSubject = memberSubject;
        groupSubjectEntity.groupRole = groupRole;
        mapAuditFields(groupSubjectEntity, resource);
        return groupSubjectEntity;
    }

    cloneForEdit() {
        const groupSubjectEntity = new GroupSubject();
        groupSubjectEntity.uuid = this.uuid;
        groupSubjectEntity.groupSubject = this.groupSubject;
        groupSubjectEntity.memberSubject = this.memberSubject;
        groupSubjectEntity.groupRole = this.groupRole;
        groupSubjectEntity.membershipStartDate = this.membershipStartDate;
        groupSubjectEntity.membershipEndDate = this.membershipEndDate;
        groupSubjectEntity.voided = this.voided;
        return groupSubjectEntity;
    }

    toJSON() {
        return {
            uuid: this.uuid,
            groupSubject: this.groupSubject,
            memberSubject: this.memberSubject,
            groupRole: this.groupRole,
            membershipStartDate: this.membershipStartDate,
            membershipEndDate: this.membershipEndDate,
            voided: this.voided,
        };
    }

    getRelationshipWithHeadOfHousehold(relatives) {
        if (this.groupRole.isHeadOfHousehold) {
            return "headOfHousehold";
        }
        const headOfHouseholdGroupSubject = this.groupSubject.getHeadOfHouseholdGroupSubject();
        if (_.isEmpty(headOfHouseholdGroupSubject)) {
            return "unavailable";
        }
        const subjectRelatives = relatives.filter(
            ({relative}) => relative.uuid === this.memberSubject.uuid
        );
        if (subjectRelatives.length === 0) {
            return "unavailable";
        }
        return subjectRelatives[0].relation.name;
    }

    getRole() {
        return this.groupRole.role;
    }

    getRoleDescription(relatives) {
        if (this.groupSubject.isHousehold()) {
            return this.getRelationshipWithHeadOfHousehold(relatives);
        }
        return this.getRole();
    }
}

export default GroupSubject;
