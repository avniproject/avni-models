import {Groups, Privilege} from "./index";
import BaseEntity from "./BaseEntity";

class GroupPrivileges extends BaseEntity {
  static schema = {
    name: "GroupPrivileges",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      group: "Groups",
      privilege: "Privilege",
      subjectTypeUuid: "string",
      programUuid: "string?",
      programEncounterTypeUuid: "string?",
      encounterTypeUuid: "string?",
      checklistDetailUuid: "string?",
      allow: { type: "bool", default: false },
    },
  };

  static fromResource(resource, entityService) {
    let groupPrivileges = new GroupPrivileges();
    groupPrivileges.uuid = resource.uuid;
    groupPrivileges.group = entityService.findEntity("uuid", resource.groupUuid, Groups.schema.name);
    groupPrivileges.privilege = entityService.findEntity(
      "uuid",
      resource.privilegeUuid,
      Privilege.schema.name
    );
    groupPrivileges.subjectTypeUuid = resource.subjectTypeUuid;
    groupPrivileges.programUuid = resource.programUuid;
    groupPrivileges.programEncounterTypeUuid = resource.programEncounterTypeUuid;
    groupPrivileges.encounterTypeUuid = resource.encounterTypeUuid;
    groupPrivileges.checklistDetailUuid = resource.checklistDetailUuid;
    groupPrivileges.allow = resource.allow;
    return groupPrivileges;
  }

  mapNonPrimitives(realmObject, entityMapper) {
    this.privilege = entityMapper.toEntity(realmObject.privilege, Privilege);
    this.groups = entityMapper.toEntity(realmObject.groups, Groups);
  }
}

export default GroupPrivileges;
