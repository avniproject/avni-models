import Individual from './Individual';
import Encounter from './Encounter';
import ProgramEnrolment from './ProgramEnrolment';
import ProgramEncounter from './ProgramEncounter';
import ChecklistItem from './ChecklistItem';

class Privilege {
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
      schema: Individual.schema.name,
      approvedPrivilegeName: Privilege.privilegeName.approveSubject,
      editPrivilegeName: Privilege.privilegeName.editSubject,
      entityFilterQueryFunc: (entity) => `subjectTypeUuid = '${entity.subjectType.uuid}'`
    },
    {
      schema: Encounter.schema.name,
      approvedPrivilegeName: Privilege.privilegeName.approveEncounter,
      editPrivilegeName: Privilege.privilegeName.editVisit,
      entityFilterQueryFunc: (entity) => `subjectTypeUuid = '${entity.individual.subjectType.uuid}' and encounterTypeUuid = '${entity.encounterType.uuid}'`
    },
    {
      schema: ProgramEnrolment.schema.name,
      approvedPrivilegeName: Privilege.privilegeName.approveEnrolment,
      editPrivilegeName: Privilege.privilegeName.editEnrolmentDetails,
      entityFilterQueryFunc: (entity) => `subjectTypeUuid = '${entity.individual.subjectType.uuid}' and programUuid = '${entity.program.uuid}'`
    },
    {
      schema: ProgramEncounter.schema.name,
      approvedPrivilegeName: Privilege.privilegeName.approveEncounter,
      editPrivilegeName: Privilege.privilegeName.editVisit,
      entityFilterQueryFunc: (entity) => `subjectTypeUuid = '${entity.programEnrolment.individual.subjectType.uuid}' and programUuid = '${entity.programEnrolment.program.uuid}' and programEncounterTypeUuid = '${entity.encounterType.uuid}'`
    },
    {
      schema: ChecklistItem.schema.name,
      approvedPrivilegeName: Privilege.privilegeName.approveChecklistItem,
      editPrivilegeName: Privilege.privilegeName.editChecklist,
      entityFilterQueryFunc: (entity) => `subjectTypeUuid = '${entity.programEnrolment.individual.subjectType.uuid}' and checklistDetailUuid = '${entity.checklist.detail.uuid}'`
    }
  ];
}

export default Privilege;
