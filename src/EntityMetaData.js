import Concept from "./Concept";
import ConceptAnswer from "./ConceptAnswer";
import Gender from "./Gender";
import AddressLevel, {LocationMapping} from "./AddressLevel";
import Individual from "./Individual";
import EntityMappingConfig from "./Schema";
import _ from "lodash";
import LocaleMapping from "./LocaleMapping";
import Settings from "./Settings";
import Program from "./Program";
import ProgramEnrolment from "./ProgramEnrolment";
import ProgramEncounter from "./ProgramEncounter";
import EncounterType from "./EncounterType";
import Encounter from "./Encounter";
import ProgramOutcome from "./ProgramOutcome";
import Form from "./application/Form";
import FormElementGroup from "./application/FormElementGroup";
import FormElement from "./application/FormElement";
import FormMapping from "./application/FormMapping";
import Checklist from "./Checklist";
import ChecklistItem from "./ChecklistItem";
import UserInfo from "./UserInfo";
import ProgramConfig from "./ProgramConfig";
import IndividualRelation from "./relationship/IndividualRelation";
import IndividualRelationship from "./relationship/IndividualRelationship";
import IndividualRelationshipType from "./relationship/IndividualRelationshipType";
import IndividualRelationGenderMapping from "./relationship/IndividualRelationGenderMapping";
import Rule from "./Rule";
import RuleDependency from "./RuleDependency";
import ChecklistItemDetail from "./ChecklistItemDetail";
import ChecklistDetail from "./ChecklistDetail";
import Video from "./videos/Video";
import VideoTelemetric from "./videos/VideoTelemetric";
import SubjectType from "./SubjectType";
import SyncTelemetry from "./SyncTelemetry";
import IdentifierSource from "./IdentifierSource";
import IdentifierAssignment from "./IdentifierAssignment";
import RuleFailureTelemetry from "./RuleFailureTelemetry";
import OrganisationConfig from "./OrganisationConfig";
import PlatformTranslation from "./PlatformTranslation";
import Translation from "./Translation";
import MyGroups from "./MyGroups";
import Groups from "./Groups";
import GroupPrivileges from "./GroupPrivileges";
import Privilege from "./Privilege";
import GroupSubject from "./GroupSubject";
import GroupRole from "./GroupRole";
import LocationHierarchy from "./LocationHierarchy";
import ReportCard from "./ReportCard";
import Dashboard from "./Dashboard";
import DashboardSectionCardMapping from "./DashboardSectionCardMapping";
import StandardReportCardType from "./StandardReportCardType";
import ApprovalStatus from "./ApprovalStatus";
import EntityApprovalStatus from "./EntityApprovalStatus";
import GroupDashboard from "./GroupDashboard";
import DashboardSection from "./DashboardSection";
import News from "./News";
import Comment from "./Comment";
import CommentThread from "./CommentThread";
import Extension from "./Extension";
import SubjectMigration from "./SubjectMigration";
import ResetSync from "./ResetSync";
import Documentation from "./Documentation";
import DocumentationItem from "./DocumentationItem";
import Task from "./task/Task";
import TaskType from "./task/TaskType";
import TaskStatus from "./task/TaskStatus";
import TaskUnAssignment from "./task/TaskUnAssignment";
import SubjectProgramEligibility from "./program/SubjectProgramEligibility";
import MenuItem from "./application/MenuItem";
import UserSubjectAssignment from "./assignment/UserSubjectAssignment";
import SubjectEntityApprovalStatus from './SubjectEntityApprovalStatus';
import EncounterEntityApprovalStatus from './EncounterEntityApprovalStatus';
import ProgramEncounterEntityApprovalStatus from './ProgramEncounterEntityApprovalStatus';
import ProgramEnrolmentEntityApprovalStatus from './ProgramEnrolmentEntityApprovalStatus';
import ChecklistItemEntityApprovalStatus from './ChecklistItemEntityApprovalStatus';

const refData = (clazz, { res, filter = "lastModified", translated, parent, syncWeight, resUrl } = {}) => ({
  schemaName: clazz.schema.name,
  entityName: clazz.schema.name,
  entityClass: clazz,
  resourceName: res || _.camelCase(clazz.schema.name),
  type: "reference",
  nameTranslated: translated || false,
  resourceSearchFilterURL: filter,
  parent: parent,
  syncWeight: syncWeight,
  resourceUrl: resUrl,
});
const refDataNameTranslated = (clazz, attrs = {}) => refData(clazz, { ...attrs, translated: true });

const txData = (
  clazz,
  {
    res,
    resUrl,
    parent,
    apiVersion,
    syncWeight,
    privilegeParam,
    privilegeEntity,
    privilegeName,
    queryParam,
    hasMoreThanOneAssociation,
    apiQueryParams
  } = {}
) => ({
  schemaName: clazz.schema.name,
  entityName: _.endsWith(clazz.schema.name, "EntityApprovalStatus") ? clazz.name : clazz.schema.name,
  entityClass: _.endsWith(clazz.schema.name, "EntityApprovalStatus") ? EntityApprovalStatus : clazz,
  resourceName: res || _.camelCase(clazz.schema.name),
  resourceUrl: resUrl,
  type: "tx",
  nameTranslated: false,
  parent: parent,
  apiVersion,
  syncWeight: syncWeight,
  privilegeParam,
  privilegeEntity,
  privilegeName,
  queryParam,
  hasMoreThanOneAssociation: !!hasMoreThanOneAssociation,
  apiQueryParams
});

const checklistDetail = refData(ChecklistDetail, { syncWeight: 1 });
const rule = refData(Rule, { syncWeight: 3 });
const ruleDependency = refData(RuleDependency, { syncWeight: 3 });
const form = refData(Form, { syncWeight: 4 });
const formMapping = refData(FormMapping, { syncWeight: 1 });
const encounterType = refDataNameTranslated(EncounterType, {
  res: "operationalEncounterType",
  syncWeight: 4,
});
const program = refDataNameTranslated(Program, {
  res: "operationalProgram",
  syncWeight: 3,
});
const programOutcome = refDataNameTranslated(ProgramOutcome, { syncWeight: 3 });
const gender = refDataNameTranslated(Gender, { syncWeight: 1 });
const individualRelation = refDataNameTranslated(IndividualRelation, {
  syncWeight: 3,
});
const individualRelationGenderMapping = refDataNameTranslated(IndividualRelationGenderMapping, {
  syncWeight: 3,
});
const individualRelationshipType = refDataNameTranslated(IndividualRelationshipType, {
  syncWeight: 3,
});
const concept = refDataNameTranslated(Concept, { syncWeight: 4 });
const programConfig = refDataNameTranslated(ProgramConfig, { syncWeight: 1 });
const video = refDataNameTranslated(Video, { syncWeight: 0 });
const subjectType = refDataNameTranslated(SubjectType, {
  res: "operationalSubjectType",
  syncWeight: 1,
});
const checklistItemDetail = refData(ChecklistItemDetail, {
  parent: checklistDetail,
  syncWeight: 3,
});
const formElementGroup = refDataNameTranslated(FormElementGroup, {
  parent: form,
  syncWeight: 3,
});
const formElement = refDataNameTranslated(FormElement, {
  parent: formElementGroup,
  syncWeight: 5,
});
const conceptAnswer = refData(ConceptAnswer, {
  parent: concept,
  syncWeight: 2,
});
const identifierSource = refData(IdentifierSource, { syncWeight: 0 });
const organisationConfig = refData(OrganisationConfig, { syncWeight: 0 });
const platformTranslation = refData(PlatformTranslation, { syncWeight: 0 });
const translation = refData(Translation, { syncWeight: 0 });
const individual = txData(Individual, {
  syncWeight: 5,
  privilegeParam: "subjectTypeUuid",
  privilegeEntity: Privilege.privilegeEntityType.subject,
  privilegeName: Privilege.privilegeName.viewSubject,
});

const subjectMigration = txData(SubjectMigration, {
  res: "subjectMigrations",
  syncWeight: 0,
  privilegeParam: "subjectTypeUuid",
  privilegeEntity: Privilege.privilegeEntityType.subject,
  privilegeName: Privilege.privilegeName.viewSubject,
});

const resetSync = txData(ResetSync, {
  res: "resetSyncs",
  syncWeight: 0,
});

const addressLevel = refDataNameTranslated(AddressLevel, {
  res: "locations",
  syncWeight: 4,
});
const locationMapping = refData(LocationMapping, {
  parent: addressLevel,
  syncWeight: 4,
});

const encounter = txData(Encounter, {
  parent: individual,
  syncWeight: 7,
  privilegeParam: "encounterTypeUuid",
  privilegeEntity: Privilege.privilegeEntityType.encounter,
  privilegeName: Privilege.privilegeName.viewVisit,
});
const programEnrolment = txData(ProgramEnrolment, {
  parent: individual,
  syncWeight: 5,
  privilegeParam: "programUuid",
  privilegeEntity: Privilege.privilegeEntityType.enrolment,
  privilegeName: Privilege.privilegeName.viewEnrolmentDetails,
});
const programEncounter = txData(ProgramEncounter, {
  parent: programEnrolment,
  syncWeight: 9,
  privilegeParam: "programEncounterTypeUuid",
  privilegeEntity: Privilege.privilegeEntityType.encounter,
  privilegeName: Privilege.privilegeName.viewVisit,
});
const checklist = txData(Checklist, {
  res: "txNewChecklistEntity",
  parent: programEnrolment,
  syncWeight: 3,
  privilegeParam: "checklistDetailUuid",
  privilegeEntity: Privilege.privilegeEntityType.checklist,
  privilegeName: Privilege.privilegeName.viewChecklist,
});
const checklistItem = txData(ChecklistItem, {
  res: "txNewChecklistItemEntity",
  parent: checklist,
  syncWeight: 3,
  privilegeParam: "checklistDetailUuid",
  privilegeEntity: Privilege.privilegeEntityType.checklist,
  privilegeName: Privilege.privilegeName.viewChecklist,
});
const individualRelationship = txData(IndividualRelationship, {
  parent: individual,
  syncWeight: 2,
  privilegeParam: "subjectTypeUuid",
  privilegeEntity: Privilege.privilegeEntityType.subject,
  privilegeName: Privilege.privilegeName.viewSubject,
});
const groupSubject = txData(GroupSubject, {
  parent: individual,
  syncWeight: 0,
  privilegeParam: "subjectTypeUuid",
  privilegeEntity: Privilege.privilegeEntityType.subject,
  privilegeName: Privilege.privilegeName.viewSubject,
  hasMoreThanOneAssociation: true,
});
const videoTelemetric = txData(VideoTelemetric, {
  res: "videotelemetric",
  parent: video,
  syncWeight: 0,
});
const syncTelemetry = txData(SyncTelemetry, {
  resUrl: "syncTelemetry",
  syncWeight: 1,
});
const userInfo = txData(UserInfo, {
  resUrl: "me",
  apiVersion: "v2",
  syncWeight: 1,
});
const identifierAssignment = txData(IdentifierAssignment, { syncWeight: 0 });
const ruleFailureTelemetry = txData(RuleFailureTelemetry, {
  resUrl: "ruleFailureTelemetry",
  syncWeight: 0,
});

const groups = refData(Groups, { res: "groups", syncWeight: 0 });
const myGroups = refData(MyGroups, { res: "myGroups", syncWeight: 0 });
const groupPrivileges = refData(GroupPrivileges, {
  res: "groupPrivilege",
  syncWeight: 0,
});
const privilege = refData(Privilege, { res: "privilege", syncWeight: 0 });
const extension = refData(Extension, { res: "extensions", syncWeight: 0, filter: '' });
const groupRole = refData(GroupRole, { res: "groupRole", syncWeight: 0 });
const locationHierarchy = refData(LocationHierarchy, { res: "locations", resUrl: "locationHierarchy", syncWeight: 0 });
const reportCard = refData(ReportCard, { res: "card", syncWeight: 0 });
const dashboard = refData(Dashboard, { res: "dashboard", syncWeight: 0 });
const dashboardSection = refData(DashboardSection, { res: "dashboardSection", syncWeight: 0 });
const dashboardSectionCardMapping = refData(DashboardSectionCardMapping, { res: "dashboardSectionCardMapping", syncWeight: 0 });
const standardReportCardType = refData(StandardReportCardType, { res: "standardReportCardType", syncWeight: 0 });
const approvalStatus = refData(ApprovalStatus, { res: "approvalStatus", syncWeight: 0 });
const groupDashboard = refData(GroupDashboard, { res: "groupDashboard", syncWeight: 0 });
const entityApprovalStatus = txData(EntityApprovalStatus, { res: "entityApprovalStatus", syncWeight: 2 });
const subjectEntityApprovalStatus = txData(SubjectEntityApprovalStatus,
  { res: "entityApprovalStatus",
    resUrl: "entityApprovalStatus",
    apiQueryParams: {"entityType": "Subject"},
    privilegeParam: "entityTypeUuid",
    syncWeight: 2 });
const encounterEntityApprovalStatus = txData(EncounterEntityApprovalStatus,
  { res: "entityApprovalStatus",
    resUrl: "entityApprovalStatus",
    apiQueryParams: {"entityType": "Encounter"},
    privilegeParam: "entityTypeUuid",
    syncWeight: 2 });
const programEncounterEntityApprovalStatus = txData(ProgramEncounterEntityApprovalStatus,
  { res: "entityApprovalStatus",
    resUrl: "entityApprovalStatus",
    apiQueryParams: {"entityType": "ProgramEncounter"},
    privilegeParam: "entityTypeUuid",
    syncWeight: 2 });
const programEnrolmentEntityApprovalStatus = txData(ProgramEnrolmentEntityApprovalStatus,
  { res: "entityApprovalStatus",
    resUrl: "entityApprovalStatus",
    apiQueryParams: {"entityType": "ProgramEnrolment"},
    privilegeParam: "entityTypeUuid",
    syncWeight: 2 });
const checklistItemEntityApprovalStatus = txData(ChecklistItemEntityApprovalStatus,
  { res: "entityApprovalStatus",
    resUrl: "entityApprovalStatus",
    apiQueryParams: {"entityType": "ChecklistItem"},
    privilegeParam: "entityTypeUuid",
    syncWeight: 2 });
const news = txData(News, { syncWeight: 0 });
const documentation = refData(Documentation, {res: 'documentations', syncWeight: 0});
const documentationItem = refData(DocumentationItem, {res: 'documentationItems', parent: documentation, syncWeight: 0});

const comment = txData(Comment, {
  parent: individual,
  syncWeight: 1,
  privilegeParam: "subjectTypeUuid",
  privilegeEntity: Privilege.privilegeEntityType.subject,
  privilegeName: Privilege.privilegeName.viewSubject,
});
const commentThread = txData(CommentThread, {
  syncWeight: 1,
  privilegeParam: "subjectTypeUuid",
  privilegeEntity: Privilege.privilegeEntityType.subject,
  privilegeName: Privilege.privilegeName.viewSubject,
});
const task = txData(Task, {syncWeight: 0 });
const taskType = refData(TaskType, { res: 'taskType', syncWeight: 0 });
const taskStatus = refData(TaskStatus, { res: 'taskStatus', syncWeight: 0 });
const taskUnAssigment = txData(TaskUnAssignment, { res: 'taskUnAssignments', syncWeight: 0 });
const menuItem = refData(MenuItem, {res: 'menuItem', syncWeight: 0});

const subjectProgramEligibility = txData(SubjectProgramEligibility, {
  resUrl: "subjectProgramEligibility",
  syncWeight:0,
  privilegeParam: "subjectTypeUuid",
  privilegeEntity: Privilege.privilegeEntityType.subject,
  privilegeName: Privilege.privilegeName.viewSubject,
});

const userSubjectAssignment = txData(UserSubjectAssignment, {syncWeight: 0});

class EntityMetaData {
  //order is important. last entity in each (tx and ref) with be executed first. parent should be synced before the child.
  static model() {
    return [
      groupDashboard,
      approvalStatus,
      dashboardSectionCardMapping,
      dashboardSection,
      dashboard,
      reportCard,
      standardReportCardType,
      menuItem,
      locationHierarchy,
      video,
      checklistItemDetail,
      checklistDetail,
      rule,
      ruleDependency,
      individualRelationshipType,
      individualRelationGenderMapping,
      individualRelation,
      programConfig,
      formMapping,
      formElement,
      formElementGroup,
      form,
      documentationItem,
      documentation,
      identifierSource,
      organisationConfig,
      platformTranslation,
      translation,

      locationMapping,
      addressLevel,
      taskStatus,
      taskType,
      encounterType,
      program,
      programOutcome,
      gender,
      groupRole,
      subjectType,
      conceptAnswer,
      concept,
      myGroups,
      groupPrivileges,
      groups,
      privilege,

      resetSync,
      subjectMigration,
      userSubjectAssignment,
      task,
      taskUnAssigment,
      subjectProgramEligibility,
      news,
      videoTelemetric,
      groupSubject,
      comment,
      commentThread,
      entityApprovalStatus,
      subjectEntityApprovalStatus,
      encounterEntityApprovalStatus,
      programEncounterEntityApprovalStatus,
      programEnrolmentEntityApprovalStatus,
      checklistItemEntityApprovalStatus,
      individualRelationship,
      checklistItem,
      checklist,
      encounter,
      identifierAssignment,
      programEncounter,
      programEnrolment,
      individual,
      extension,
      userInfo,
      syncTelemetry,
      ruleFailureTelemetry,
    ];
  }

  static entitiesLoadedFromServer() {
    return _.differenceBy(EntityMappingConfig.getInstance().getEntities(), [Settings, LocaleMapping], "schema.name");
  }

  static findByName(entityName) {
    return _.find(
      EntityMetaData.model(),
      //TODO check if this works
      (entityMetadata) => entityMetadata.entityName === entityName
    );
  }
}

export default EntityMetaData;
