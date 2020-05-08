import SubjectType from "./SubjectType";
import General from "./utility/General";
import BaseEntity from "./BaseEntity";
import GroupSubject from "./GroupSubject";

class GroupRole {
  static schema = {
    name: "GroupRole",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      groupSubjectType: "SubjectType",
      memberSubjectType: "SubjectType",
      role: "string",
      primary: { type: "bool", default: false },
      maximumNumberOfMembers: "double",
      minimumNumberOfMembers: "double",
      voided: { type: "bool", default: false },
    },
  };

  static householdRoles = {
    head: "Head of household",
    member: "Member",
  };

  get isHouseholdMember() {
    return this.groupSubjectType.isHousehold() && this.role === GroupRole.householdRoles.member;
  }

  get isHeadOfHousehold() {
    return this.groupSubjectType.isHousehold() && this.role === GroupRole.householdRoles.head;
  }

  static createEmptyInstance() {
    const groupRole = new GroupRole();
    groupRole.uuid = General.randomUUID();
    groupRole.groupSubjectType = SubjectType.create("");
    groupRole.memberSubjectType = SubjectType.create("");
    return groupRole;
  }

  static fromResource(resource, entityService) {
    const groupSubjectType = entityService.findByKey(
      "uuid",
      resource.groupSubjectTypeUUID,
      SubjectType.schema.name
    );
    const memberSubjectType = entityService.findByKey(
      "uuid",
      resource.memberSubjectTypeUUID,
      SubjectType.schema.name
    );
    const groupRole = General.assignFields(resource, new GroupRole(), [
      "uuid",
      "role",
      "primary",
      "maximumNumberOfMembers",
      "minimumNumberOfMembers",
      "voided",
    ]);
    groupRole.groupSubjectType = groupSubjectType;
    groupRole.memberSubjectType = memberSubjectType;
    return groupRole;
  }

  static associateChild(child, childEntityClass, childResource, entityService) {
    let groupRole = BaseEntity.getParentEntity(
      entityService,
      childEntityClass,
      childResource,
      "groupRoleUUID",
      GroupRole.schema.name
    );
    if (childEntityClass === GroupSubject) {
      BaseEntity.addNewChild(child, form.formElementGroups);
    } else throw `${childEntityClass.name} not support by Group Role`;
    return groupRole;
  }

  static parentAssociations = () => new Map([[SubjectType, "groupSubjectTypeUUID"]]);
}

export default GroupRole;
