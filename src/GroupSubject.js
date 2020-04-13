import BaseEntity from "./BaseEntity";
import _ from "lodash";
import Individual from "./Individual";
import ResourceUtil from "./utility/ResourceUtil";
import General from "./utility/General";
import GroupRole from "./GroupRole";

class GroupSubject extends BaseEntity {
    static schema = {
        name: 'GroupSubject',
        primaryKey: 'uuid',
        properties: {
            uuid: 'string',
            groupSubject: 'Individual',
            memberSubject: 'Individual',
            groupRole: 'GroupRole',
            membershipStartDate: 'date',
            membershipEndDate: {type: 'date', optional: true},
            voided: {type: 'bool', default: false}
        }
    };

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

    static create({uuid, groupSubject, memberSubject, groupRole, membershipStartDate, membershipEndDate}) {
        const groupSubjectEntity = GroupSubject.createEmptyInstance(uuid);
        groupSubjectEntity.groupSubject = groupSubject;
        groupSubjectEntity.memberSubject = memberSubject;
        groupSubjectEntity.groupRole = groupRole;
        groupSubjectEntity.membershipStartDate = membershipStartDate.value;
        groupSubjectEntity.membershipEndDate = membershipEndDate.value;
        return groupSubjectEntity;
    }

    static parentAssociations = () => new Map([
        [Individual, "groupSubjectUUID"],
        [GroupRole, "groupRoleUUID"]
    ]);

    static fromResource(resource, entityService) {
        const groupSubject = entityService.findByKey("uuid", ResourceUtil.getUUIDFor(resource, "groupSubjectUUID"), Individual.schema.name);
        const memberSubject = entityService.findByKey("uuid", ResourceUtil.getUUIDFor(resource, "memberSubjectUUID"), Individual.schema.name);
        const groupRole = entityService.findByKey("uuid", ResourceUtil.getUUIDFor(resource, "groupRoleUUID"), GroupRole.schema.name);
        const groupSubjectEntity = General.assignFields(resource, new GroupSubject(), ["uuid", "voided"], ["membershipStartDate", "membershipEndDate"]);
        groupSubjectEntity.groupSubject = groupSubject;
        groupSubjectEntity.memberSubject = memberSubject;
        groupSubjectEntity.groupRole = groupRole;
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
            voided: this.voided
        }
    }

    getRelationshipWithHeadOfHousehold() {
        if (this.groupRole.isHeadOfHousehold) {
            return 'headOfHousehold';
        }
        const headOfHouseholdGroupSubject = this.groupSubject.getHeadOfHouseholdGroupSubject();
        if (_.isEmpty(headOfHouseholdGroupSubject)) {
            return 'unavailable';
        }
        const relationship = this.memberSubject.relationships.filter(({individualA, individualB, voided}) => (individualA.uuid === headOfHouseholdGroupSubject.memberSubject.uuid ||
            individualB.uuid === headOfHouseholdGroupSubject.memberSubject.uuid) && !voided);
        if (relationship.length === 0) {
            return 'unavailable';
        }
        return relationship[0].relationship.individualAIsToBRelation.name;
    }

    getRole() {
        return this.groupRole.role;
    }

}

export default GroupSubject;
