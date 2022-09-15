import Groups from "./Groups";
import Privilege from "./Privilege";
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

  constructor(that) {
    super(that);
  }

  get group() {
      return this.toEntity("group", Groups);
  }

  set group(x) {
      this.that.group = x;
  }

  get privilege() {
      return this.toEntity("privilege", Privilege);
  }

  set privilege(x) {
      this.that.privilege = x;
  }

  get subjectTypeUuid() {
      return this.that.subjectTypeUuid;
  }

  set subjectTypeUuid(x) {
      this.that.subjectTypeUuid = x;
  }

  get programUuid() {
      return this.that.programUuid;
  }

  set programUuid(x) {
      this.that.programUuid = x;
  }

  get programEncounterTypeUuid() {
      return this.that.programEncounterTypeUuid;
  }

  set programEncounterTypeUuid(x) {
      this.that.programEncounterTypeUuid = x;
  }

  get encounterTypeUuid() {
      return this.that.encounterTypeUuid;
  }

  set encounterTypeUuid(x) {
      this.that.encounterTypeUuid = x;
  }

  get checklistDetailUuid() {
      return this.that.checklistDetailUuid;
  }

  set checklistDetailUuid(x) {
      this.that.checklistDetailUuid = x;
  }

  get allow() {
      return this.that.allow;
  }

  set allow(x) {
      this.that.allow = x;
  }

  static fromResource(resource, entityService) {
    let groupPrivileges = new GroupPrivileges();
    groupPrivileges.uuid = resource.uuid;
    groupPrivileges.group = entityService.findByKey("uuid", resource.groupUuid, Groups.schema.name);
    groupPrivileges.privilege = entityService.findByKey(
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
}

export default GroupPrivileges;
