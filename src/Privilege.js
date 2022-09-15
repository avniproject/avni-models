import BaseEntity from "./BaseEntity";
import SchemaNames from "./SchemaNames";

class Privilege extends BaseEntity {
  static schema = {
    name: "Privilege",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      name: "string",
      description: "string",
      entityType: "string",
    },
  };

  constructor(that) {
    super(that);
  }

  get name() {
      return this.that.name;
  }

  set name(x) {
      this.that.name = x;
  }

  get description() {
      return this.that.description;
  }

  set description(x) {
      this.that.description = x;
  }

  get entityType() {
      return this.that.entityType;
  }

  set entityType(x) {
      this.that.entityType = x;
  }

  static privilegeName = {
    viewSubject: "View subject",
    registerSubject: "Register subject",
    editSubject: "Edit subject",
    voidSubject: "Void subject",
    enrolSubject: "Enrol subject",
    viewEnrolmentDetails: "View enrolment details",
    editEnrolmentDetails: "Edit enrolment details",
    exitEnrolment: "Exit enrolment",
    viewVisit: "View visit",
    scheduleVisit: "Schedule visit",
    performVisit: "Perform visit",
    editVisit: "Edit visit",
    cancelVisit: "Cancel visit",
    viewChecklist: "View checklist",
    editChecklist: "Edit checklist",
    addMember: "Add member",
    editMember: "Edit member",
    removeMember: "Remove member",
    approveSubject: "Approve Subject",
    approveEnrolment: "Approve Enrolment",
    approveEncounter: "Approve Encounter",
    approveChecklistItem: "Approve ChecklistItem",
  };

  static privilegeEntityType = {
    subject: "Subject",
    enrolment: "Enrolment",
    encounter: "Encounter",
    checklist: "Checklist",
    checklistItem: "ChecklistItem",
  };

  static fromResource(resource) {
    let privilege = new Privilege();
    privilege.uuid = resource.uuid;
    privilege.name = resource.name;
    privilege.description = resource.description;
    privilege.entityType = resource.entityType;
    return privilege;
  }

  static schemaToPrivilegeMetadata = [
    {
      schema: SchemaNames.Individual,
      approvedPrivilegeName: Privilege.privilegeName.approveSubject,
      editPrivilegeName: Privilege.privilegeName.editSubject,
      entityFilterQueryFunc: (entity) => `subjectTypeUuid = '${entity.subjectType.uuid}'`
    },
    {
      schema: SchemaNames.Encounter,
      approvedPrivilegeName: Privilege.privilegeName.approveEncounter,
      editPrivilegeName: Privilege.privilegeName.editVisit,
      entityFilterQueryFunc: (entity) => `subjectTypeUuid = '${entity.individual.subjectType.uuid}' and encounterTypeUuid = '${entity.encounterType.uuid}'`
    },
    {
      schema: SchemaNames.ProgramEnrolment,
      approvedPrivilegeName: Privilege.privilegeName.approveEnrolment,
      editPrivilegeName: Privilege.privilegeName.editEnrolmentDetails,
      entityFilterQueryFunc: (entity) => `subjectTypeUuid = '${entity.individual.subjectType.uuid}' and programUuid = '${entity.program.uuid}'`
    },
    {
      schema: SchemaNames.ProgramEncounter,
      approvedPrivilegeName: Privilege.privilegeName.approveEncounter,
      editPrivilegeName: Privilege.privilegeName.editVisit,
      entityFilterQueryFunc: (entity) => `subjectTypeUuid = '${entity.programEnrolment.individual.subjectType.uuid}' and programUuid = '${entity.programEnrolment.program.uuid}' and programEncounterTypeUuid = '${entity.encounterType.uuid}'`
    },
    {
      schema: SchemaNames.ChecklistItem,
      approvedPrivilegeName: Privilege.privilegeName.approveChecklistItem,
      editPrivilegeName: Privilege.privilegeName.editChecklist,
      entityFilterQueryFunc: (entity) => `subjectTypeUuid = '${entity.programEnrolment.individual.subjectType.uuid}' and checklistDetailUuid = '${entity.checklist.detail.uuid}'`
    }
  ];
}

export default Privilege;
