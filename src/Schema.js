import Settings from "./Settings";
import LocaleMapping from "./LocaleMapping";
import Concept, {ConceptAnswer} from "./Concept";
import Individual from "./Individual";
import Family from "./Family";
import AddressLevel, {LocationMapping} from "./AddressLevel";
import UserDefinedIndividualProperty from "./UserDefinedIndividualProperty";
import Gender from "./Gender";
import EntitySyncStatus from "./EntitySyncStatus";
import ProgramEnrolment from "./ProgramEnrolment";
import ProgramEncounter from "./ProgramEncounter";
import Program from "./Program";
import Observation from "./Observation";
import Encounter from "./Encounter";
import EncounterType from "./EncounterType";
import ProgramOutcome from "./ProgramOutcome";
import FormElement from "./application/FormElement";
import FormElementGroup from "./application/FormElementGroup";
import Form from "./application/Form";
import KeyValue from "./application/KeyValue";
import Format from "./application/Format";
import EntityQueue from "./EntityQueue";
import FormMapping from "./application/FormMapping";
import ConfigFile from "./ConfigFile";
import ChecklistItemStatus from "./ChecklistItemStatus";
import ChecklistItemDetail from "./ChecklistItemDetail";
import ChecklistDetail from "./ChecklistDetail";
import Checklist from "./Checklist";
import ChecklistItem from "./ChecklistItem";
import _ from "lodash";
import UserInfo from "./UserInfo";
import ProgramConfig from "./ProgramConfig";
import StringKeyNumericValue from "./application/StringKeyNumericValue";
import VisitScheduleInterval from "./VisitScheduleInterval";
import VisitScheduleConfig from "./VisitScheduleConfig";
import IndividualRelation from "./relationship/IndividualRelation";
import IndividualRelationship from "./relationship/IndividualRelationship";
import IndividualRelationshipType from "./relationship/IndividualRelationshipType";
import IndividualRelationGenderMapping from "./relationship/IndividualRelationGenderMapping";
import Rule from "./Rule";
import RuleDependency from "./RuleDependency";
import Video from "./videos/Video";
import VideoTelemetric from "./videos/VideoTelemetric";
import MediaQueue from "./MediaQueue";
import Point from "./geo/Point";
import SubjectType from "./SubjectType";
import SyncTelemetry from "./SyncTelemetry";
import IdentifierSource from "./IdentifierSource";
import IdentifierAssignment from "./IdentifierAssignment";
import RuleFailureTelemetry from "./RuleFailureTelemetry";
import BeneficiaryModePin from "./BeneficiaryModePin";
import OrganisationConfig from "./OrganisationConfig";
import PlatformTranslation from "./PlatformTranslation";
import Translation from "./Translation";
import Groups from "./Groups";
import GroupPrivileges from "./GroupPrivileges";
import MyGroups from "./MyGroups";
import Privilege from "./Privilege";
import General from "./utility/General";
import GroupRole from "./GroupRole";
import GroupSubject from "./GroupSubject";
import DashboardCache from "./DashboardCache";
import LocationHierarchy from "./LocationHierarchy";
import ReportCard from "./ReportCard";
import Dashboard from "./Dashboard";
import DashboardSectionCardMapping from "./DashboardSectionCardMapping";
import DraftSubject from './draft/DraftSubject';
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

export default {
  //order is important, should be arranged according to the dependency
  schema: [
    LocaleMapping,
    Settings,
    ConceptAnswer,
    Concept,
    EncounterType,
    Gender,
    UserDefinedIndividualProperty,
    LocationMapping,
    AddressLevel,
    KeyValue,
    Form,
    FormMapping,
    FormElementGroup,
    FormElement,
    SubjectType,
    Individual,
    ProgramOutcome,
    Program,
    ProgramEnrolment,
    Observation,
    ProgramEncounter,
    Encounter,
    EntitySyncStatus,
    EntityQueue,
    ConfigFile,
    Checklist,
    ChecklistItem,
    Format,
    UserInfo,
    StringKeyNumericValue,
    VisitScheduleInterval,
    VisitScheduleConfig,
    ProgramConfig,
    Family,
    IndividualRelation,
    IndividualRelationGenderMapping,
    IndividualRelationshipType,
    IndividualRelationship,
    RuleDependency,
    Rule,
    ChecklistItemStatus,
    ChecklistDetail,
    ChecklistItemDetail,
    VideoTelemetric,
    Video,
    MediaQueue,
    Point,
    SyncTelemetry,
    IdentifierSource,
    IdentifierAssignment,
    RuleFailureTelemetry,
    BeneficiaryModePin,
    OrganisationConfig,
    PlatformTranslation,
    Translation,
    Groups,
    MyGroups,
    GroupPrivileges,
    Privilege,
    GroupRole,
    GroupSubject,
    DashboardCache,
    LocationHierarchy,
    ReportCard,
    Dashboard,
    DashboardSectionCardMapping,
    DraftSubject,
    StandardReportCardType,
    ApprovalStatus,
    EntityApprovalStatus,
    GroupDashboard,
    DashboardSection,
    News,
    Comment,
    CommentThread,
    Extension,
    SubjectMigration,
  ],
  schemaVersion: 149,
  migration: function (oldDB, newDB) {
    if (oldDB.schemaVersion < 10) {
      var oldObjects = oldDB.objects("DecisionConfig");
      oldObjects.forEach((decisionConfig) => {
        newDB.create(
          ConfigFile.schema.name,
          ConfigFile.create(decisionConfig.fileName, decisionConfig.decisionCode),
          true
        );
      });
    }
    if (oldDB.schemaVersion < 17) {
      var oldObjects = oldDB.objects("AddressLevel");
      var newObjects = newDB.objects("AddressLevel");

      for (var i = 0; i < oldObjects.length; i++) {
        newObjects[i].name = oldObjects[i].title;
      }
    }
    if (oldDB.schemaVersion < 23) {
      var newObjects = newDB.objects("Individual");
      for (var i = 0; i < newObjects.length; i++) {
        newObjects[i].registrationDate = new Date(2017, 0, 0);
      }
    }
    if (oldDB.schemaVersion < 30) {
      var oldObjects = oldDB.objects("Settings");
      var newObjects = newDB.objects("Settings");
      for (var i = 0; i < newObjects.length; i++) {
        newObjects[i].locale = null;
      }
      const oldLocaleMappings = newDB.objects("LocaleMapping");
      newDB.delete(oldLocaleMappings);
    }
    if (oldDB.schemaVersion < 32) {
      const oldSettings = newDB.objects("Settings");
      newDB.delete(oldSettings);
    }
    if (oldDB.schemaVersion < 33) {
      const checklists = newDB.objects("Checklist");
      _.forEach(checklists, (checklist) => {
        checklist.baseDate = checklist.programEnrolment.individual.dateOfBirth;
      });
    }
    if (oldDB.schemaVersion < 38) {
      const programs = newDB.objects("Program");
      _.forEach(programs, (program) => {
        program.colour = Program.randomColour();
      });
    }
    if (oldDB.schemaVersion < 39) {
      const settings = newDB.objects("Settings");
      _.forEach(settings, (setting) => {
        setting.userId = "";
        setting.password = "";
      });
    }
    if (oldDB.schemaVersion < 40) {
      const settings = newDB.objects("Settings");
      _.forEach(settings, (setting) => {
        setting.authToken = "";
      });
    }
    if (oldDB.schemaVersion < 41) {
      const settings = newDB.objects("Settings");
      _.forEach(settings, (setting) => {
        setting.poolId = "";
        setting.clientId = "";
        setting.organisationName = "";
      });
    }
    if (oldDB.schemaVersion < 42) {
      const individuals = newDB.objects("Individual");
      _.forEach(individuals, (individual) => {
        individual.firstName = "";
        individual.lastName = "";
      });
    }
    if (oldDB.schemaVersion < 48) {
      const concepts = newDB.objects("Concept");
      _.forEach(concepts, (concept) => {
        concept.voided = false;
      });
      const conceptAnswers = newDB.objects("ConceptAnswer");
      _.forEach(conceptAnswers, (conceptAnswer) => {
        conceptAnswer.voided = false;
      });
    }
    if (oldDB.schemaVersion < 49) {
      const oldFormElements = oldDB.objects("FormElement");
      const formElements = newDB.objects("FormElement");
      for (let i = 0; i < oldFormElements.length; i++) {
        formElements[i].displayOrder = oldFormElements[i].displayOrder;
      }
      const oldFormElementGroups = oldDB.objects("FormElementGroup");
      const formElementGroups = newDB.objects("FormElementGroup");
      for (let j = 0; j < oldFormElementGroups.length; j++) {
        formElementGroups[j].displayOrder = oldFormElementGroups[j].displayOrder;
      }
    }
    if (oldDB.schemaVersion < 50) {
      const concepts = newDB.objects("Concept");
      _.forEach(concepts, (concept) => {
        if (concept.datatype === "N/A") {
          concept.datatype = "NA";
        }
      });
    }
    if (oldDB.schemaVersion < 51) {
      const conceptAnswers = newDB.objects("ConceptAnswer");
      _.forEach(conceptAnswers, (conceptAnswer) => {
        conceptAnswer.unique = false;
      });
    }
    if (oldDB.schemaVersion < 54) {
      _.forEach(newDB.objects("FormMapping"), (fm) => (fm.voided = false));
    }
    if (oldDB.schemaVersion < 55) {
      _.forEach(newDB.objects("EncounterType"), (fm) => (fm.voided = false));
    }
    if (oldDB.schemaVersion < 64) {
      _.forEach(newDB.objects("EncounterType"), (et) => {
        if (_.isEmpty(et.operationalEncounterTypeName)) {
          et.operationalEncounterTypeName = et.name;
        }
        if (_.isEmpty(et.displayName)) {
          et.displayName = _.isEmpty(et.operationalEncounterTypeName)
            ? et.name
            : et.operationalEncounterTypeName;
        }
      });
      _.forEach(newDB.objects("Program"), (p) => {
        if (_.isEmpty(p.operationalProgramName)) {
          p.operationalProgramName = p.name;
        }
        if (_.isEmpty(p.displayName)) {
          p.displayName = _.isEmpty(p.operationalProgramName) ? p.name : p.operationalProgramName;
        }
      });
    }
    if (oldDB.schemaVersion < 67) {
      const oldConceptAnswers = oldDB.objects("ConceptAnswer");
      const conceptAnswers = newDB.objects("ConceptAnswer");
      for (let i = 0; i < oldConceptAnswers.length; i++) {
        conceptAnswers[i].answerOrder = oldConceptAnswers[i].answerOrder;
      }
    }

    if (oldDB.schemaVersion < 73) {
      const oldChecklists = newDB.objects("Checklist");
      const oldChecklistItems = newDB.objects("ChecklistItem");
      newDB.delete(oldChecklistItems);
      newDB.delete(oldChecklists);
    }

    if (oldDB.schemaVersion < 74) {
      _.forEach(newDB.objects("Individual"), (individual) => (individual.voided = false));
    }

    if (oldDB.schemaVersion < 76) {
      const oldAddressLevels = oldDB.objects("AddressLevel");
      const addressLevels = newDB.objects("AddressLevel");
      for (let i = 0; i < oldAddressLevels.length; i++) {
        addressLevels[i].level = oldAddressLevels[i].level;
      }
    }
    if (oldDB.schemaVersion < 82) {
      const oblongProgramEncounters = newDB
        .objects("ProgramEncounter")
        .filtered("maxVisitDateTime=null and earliestVisitDateTime!=null");
      for (let i = 0; i < oblongProgramEncounters.length; i++) {
        newDB.create(
          "EntityQueue",
          EntityQueue.create(oblongProgramEncounters[i], "ProgramEncounter", new Date())
        );
        oblongProgramEncounters[i].earliestVisitDateTime = null;
      }
    }
    if (oldDB.schemaVersion < 83) {
      _.forEach([...newDB.objects("Settings")], (settings) => {
        if (
          settings.pageSize === 0 ||
          settings.pageSize === undefined ||
          settings.pageSize === null
        ) {
          settings.pageSize = 100;
        }
      });
    }
    if (oldDB.schemaVersion < 87) {
      _.forEach(
        newDB.objects("ChecklistItemDetail"),
        (item) => (item.scheduleOnExpiryOfDependency = false)
      );
    }
    if (oldDB.schemaVersion < 90) {
      _.forEach(newDB.objects("Settings"), (item) => (item.devSkipValidation = false));
    }
    if (oldDB.schemaVersion < 93) {
      const individuals = newDB.objects("Individual");
      if (individuals.length > 0) {
        const individualSubjectType = SubjectType.create("Individual");
        //This is the uuid used in server migration to create Individual subjectType
        individualSubjectType.uuid = "9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3";
        individualSubjectType.voided = false;
        newDB.create(SubjectType.schema.name, individualSubjectType, true);
        _.forEach(individuals, (item) => (item.subjectType = individualSubjectType));
      }
    }
    if (oldDB.schemaVersion < 94) {
      _.forEach(newDB.objects("Settings"), (item) => (item.captureLocation = true));
    }

    if (oldDB.schemaVersion < 95) {
      _.forEach(
        newDB.objects("ProgramEnrolment"),
        (programEnrolment) => (programEnrolment.voided = false)
      );
      _.forEach(
        newDB.objects("ProgramEncounter"),
        (programEncounter) => (programEncounter.voided = false)
      );
      _.forEach(newDB.objects("Encounter"), (encounter) => (encounter.voided = false));
    }

    if (oldDB.schemaVersion < 96) {
      _.forEach(
        newDB.objects("UserInfo"),
        (userInfo) => (userInfo.settings = UserInfo.DEFAULT_SETTINGS)
      );
    }

    if (oldDB.schemaVersion < 102) {
      const programs = newDB.objects("Program");
      _.forEach(programs, (program) => {
        program.programSubjectLabel = program.operationalProgramName || program.name;
      });
    }
    if (oldDB.schemaVersion < 103) {
      _.forEach(newDB.objects(UserInfo.schema.name), (userInfo) => {
        userInfo.username = "";
        newDB.create(EntityQueue.schema.name, EntityQueue.create(userInfo, UserInfo.schema.name));
      });
    }
    if (oldDB.schemaVersion < 104) {
      /*
            Assumption: All existing users have just one subject type
            Reason for migration: Server has a mandatory subject type on all form mappings.
            App requires subject type to be present.
            However, if someone upgrades and does not sync, app will break.
            This migration fixes this issue.
             */
      const subjectType = oldDB.objects("SubjectType")[0];
      const formMappings = newDB.objects("FormMapping");
      _.forEach(formMappings, (formMapping) => {
        formMapping.subjectType = subjectType;
      });
    }
    if (oldDB.schemaVersion < 105) {
      _.forEach(newDB.objects(Rule.schema.name), (rule) => {
        rule.entity = {
          uuid: rule.program ? rule.program.uuid : rule.form ? rule.form.uuid : null,
          type: rule.program ? "Program" : rule.form ? "Form" : "None",
        };
      });
    }
    if (oldDB.schemaVersion < 108) {
      _.forEach(newDB.objects(Encounter.schema.name), (enc) => {
        enc.cancelObservations = [];
      });
    }
    if (oldDB.schemaVersion < 109) {
      _.forEach(newDB.objects(RuleFailureTelemetry.schema.name), (rule) => {
        rule.errorDateTime = new Date();
        rule.closed = false;
      });
    }
    if (oldDB.schemaVersion < 116) {
      //this migration creates entry in EntitySyncStatus for all entityType as per the old synced audit so that those entities are not synced again.
      const olderSubjectTypeEntry = newDB
        .objects(EntitySyncStatus.schema.name)
        .filtered("entityName = $0", "Individual");
      const olderProgramEntry = newDB
        .objects(EntitySyncStatus.schema.name)
        .filtered("entityName = $0", "ProgramEnrolment");
      const olderChecklistEntry = newDB
        .objects(EntitySyncStatus.schema.name)
        .filtered("entityName = $0", "ChecklistItem");
      const olderChecklistItemEntry = newDB
        .objects(EntitySyncStatus.schema.name)
        .filtered("entityName = $0", "Checklist");
      const olderProgramEncounterEntry = newDB
        .objects(EntitySyncStatus.schema.name)
        .filtered("entityName = $0", "ProgramEncounter");
      const olderEncounterEntry = newDB
        .objects(EntitySyncStatus.schema.name)
        .filtered("entityName = $0", "Encounter");
      const olderIndividualRelationshipEntry = newDB
        .objects(EntitySyncStatus.schema.name)
        .filtered("entityName = $0", "IndividualRelationship");
      const subjectType = newDB.objects(SubjectType.schema.name);
      const program = newDB.objects(Program.schema.name);
      const formMappings = newDB
        .objects(FormMapping.schema.name)
        .filtered("observationsTypeEntityUUID <> null AND voided = false")
        .filtered(`TRUEPREDICATE DISTINCT(observationsTypeEntityUUID)`);
      const checklistDetail = newDB.objects(ChecklistDetail.schema.name);
      _.forEach(subjectType, (st) => {
        newDB.create(
          EntitySyncStatus.schema.name,
          EntitySyncStatus.create(
            olderSubjectTypeEntry[0].entityName,
            olderSubjectTypeEntry[0].loadedSince,
            General.randomUUID(),
            st.uuid
          ),
          true
        );
        newDB.create(
          EntitySyncStatus.schema.name,
          EntitySyncStatus.create(
            olderIndividualRelationshipEntry[0].entityName,
            olderIndividualRelationshipEntry[0].loadedSince,
            General.randomUUID(),
            st.uuid
          ),
          true
        );
      });
      _.forEach(program, (pt) => {
        newDB.create(
          EntitySyncStatus.schema.name,
          EntitySyncStatus.create(
            olderProgramEntry[0].entityName,
            olderProgramEntry[0].loadedSince,
            General.randomUUID(),
            pt.uuid
          ),
          true
        );
      });
      _.forEach(checklistDetail, (ct) => {
        newDB.create(
          EntitySyncStatus.schema.name,
          EntitySyncStatus.create(
            olderChecklistItemEntry[0].entityName,
            olderChecklistItemEntry[0].loadedSince,
            General.randomUUID(),
            ct.uuid
          ),
          true
        );
        newDB.create(
          EntitySyncStatus.schema.name,
          EntitySyncStatus.create(
            olderChecklistEntry[0].entityName,
            olderChecklistEntry[0].loadedSince,
            General.randomUUID(),
            ct.uuid
          ),
          true
        );
      });
      _.forEach(formMappings, (fm) => {
        if (fm.entityUUID) {
          newDB.create(
            EntitySyncStatus.schema.name,
            EntitySyncStatus.create(
              olderProgramEncounterEntry[0].entityName,
              olderProgramEncounterEntry[0].loadedSince,
              General.randomUUID(),
              fm.observationsTypeEntityUUID
            ),
            true
          );
        } else {
          newDB.create(
            EntitySyncStatus.schema.name,
            EntitySyncStatus.create(
              olderEncounterEntry[0].entityName,
              olderEncounterEntry[0].loadedSince,
              General.randomUUID(),
              fm.observationsTypeEntityUUID
            ),
            true
          );
        }
      });
    }
    if (oldDB.schemaVersion < 117) {
      _.forEach(newDB.objects(Individual.schema.name), (ind) => {
        ind.groupSubjects = [];
      });
    }

    if (oldDB.schemaVersion < 119) {
      _.forEach(newDB.objects(Groups.schema.name), (group) => {
        group.hasAllPrivileges = false;
      });
    }

    if (oldDB.schemaVersion < 120) {
      _.forEach(newDB.objects(SubjectType.schema.name), (sub) => {
        sub.group = false;
        sub.household = false;
      });
    }

    if (oldDB.schemaVersion < 123) {
      _.forEach(newDB.objects(SubjectType.schema.name), (sub) => {
        sub.active = true;
      });
      _.forEach(newDB.objects(Program.schema.name), (prog) => {
        prog.voided = false;
        prog.active = true;
      });
      _.forEach(newDB.objects(EncounterType.schema.name), (enc) => {
        enc.active = true;
      });
    }

    if (oldDB.schemaVersion < 124) {
      _.forEach(newDB.objects(SubjectType.schema.name), (sub) => {
        const {group, household, name} = sub;
        if (household) {
          sub.type = SubjectType.types.Household;
        } else if (group) {
          sub.type = SubjectType.types.Group
        } else if (_.includes(['Individual', 'Patient'], name)) {
          sub.type = SubjectType.types.Person
        } else {
          sub.type = SubjectType.types.Individual
        }
      });
    }

    if (oldDB.schemaVersion < 125) {
      _.forEach(newDB.objects(AddressLevel.schema.name), (add) => {
        add.voided = false
      });
    }

    if (oldDB.schemaVersion < 129) {
      _.forEach(newDB.objects(AddressLevel.schema.name), (add) => {
        const locationMapping = _.head(newDB.objects(LocationMapping.schema.name).filtered("child.uuid = $0", add.uuid));
        add.parentUuid = locationMapping ? locationMapping.parent.uuid : null;
      });
      //reset the AddressLevel sync so that typeUuid start getting sync
      const addressLevelSyncStatus = newDB.objects(EntitySyncStatus.schema.name).filtered("entityName = $0", "AddressLevel");
      newDB.create(
        EntitySyncStatus.schema.name,
        EntitySyncStatus.create(
          'AddressLevel',
          EntitySyncStatus.REALLY_OLD_DATE,
          addressLevelSyncStatus[0].uuid,
          ''
        ),
        true
      );
    }

    if (oldDB.schemaVersion < 133) {
      _.forEach(newDB.objects(ReportCard.schema.name), (reportCard) => {
        reportCard.standardReportCardType = null;
      })
    }

    if (oldDB.schemaVersion < 135) {
      const dashboardCardMappings = newDB.objects(EntitySyncStatus.schema.name).filtered("entityName = 'DashboardCardMapping'");
      _.forEach(dashboardCardMappings, dcm => newDB.delete(dcm));
    }

    if (oldDB.schemaVersion < 141) {
      _.forEach(newDB.objects(News.schema.name), news => {
        news.lastModifiedDateTime = news.publishedDate
      });
    }

    if(oldDB.schemaVersion < 145) {
      _.forEach(newDB.objects(Individual.schema.name), individual => {
        const groups = newDB.objects(GroupSubject.schema.name).filtered("memberSubject.uuid = $0", individual.uuid).map(_.identity);
        individual.groups = groups;
      });
    }
  },
};
