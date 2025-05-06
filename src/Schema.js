import Settings from "./Settings";
import LocaleMapping from "./LocaleMapping";
import Concept from "./Concept";
import ConceptAnswer from "./ConceptAnswer";
import Individual from "./Individual";
import Family from "./Family";
import AddressLevel, {LocationMapping} from "./AddressLevel";
import Gender from "./Gender";
import EntitySyncStatus from "./EntitySyncStatus";
import ProgramEnrolment from "./ProgramEnrolment";
import ProgramEncounter from "./ProgramEncounter";
import Program from "./Program";
import Observation from "./Observation";
import Encounter from "./Encounter";
import EncounterType from "./EncounterType";
import FormElement from "./application/FormElement";
import FormElementGroup from "./application/FormElementGroup";
import Form from "./application/Form";
import KeyValue from "./application/KeyValue";
import Format from "./application/Format";
import EntityQueue from "./EntityQueue";
import FormMapping from "./application/FormMapping";
import ChecklistItemStatus from "./ChecklistItemStatus";
import ChecklistItemDetail from "./ChecklistItemDetail";
import ChecklistDetail from "./ChecklistDetail";
import Checklist from "./Checklist";
import ChecklistItem from "./ChecklistItem";
import _ from "lodash";
import UserInfo from "./UserInfo";
import StringKeyNumericValue from "./application/StringKeyNumericValue";
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
import ResetSync from "./ResetSync";
import Documentation from "./Documentation";
import DocumentationItem from "./DocumentationItem";
import Task from "./task/Task";
import TaskType from "./task/TaskType";
import TaskStatus from "./task/TaskStatus";
import TaskUnAssignment from "./task/TaskUnAssignment";
import DraftEncounter from './draft/DraftEncounter';
import SubjectProgramEligibility from "./program/SubjectProgramEligibility";
import MenuItem from "./application/MenuItem";
import UserSubjectAssignment from "./assignment/UserSubjectAssignment";
import SchemaNames from "./SchemaNames";
import DashboardFilter from "./reports/DashboardFilter";
import CustomDashboardCache from './CustomDashboardCache';
import DefinedObjectSchema from "./framework/DefinedObjectSchema";
import MigrationsHelper from "./MigrationsHelper";
import MetaDataService from "./service/MetaDataService";
import ReportCardResult from "./reports/ReportCardResult";
import NestedReportCardResult from "./reports/NestedReportCardResult";

const entities = [
    ReportCardResult,
    NestedReportCardResult,
    DashboardFilter,
    LocaleMapping,
    Settings,
    ConceptAnswer,
    Concept,
    EncounterType,
    Gender,
    LocationMapping,
    AddressLevel,
    KeyValue,
    Form,
    FormMapping,
    FormElementGroup,
    FormElement,
    SubjectType,
    Individual,
    Program,
    ProgramEnrolment,
    Observation,
    ProgramEncounter,
    Encounter,
    EntitySyncStatus,
    EntityQueue,
    Checklist,
    ChecklistItem,
    Format,
    UserInfo,
    StringKeyNumericValue,
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
    CustomDashboardCache,
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
    ResetSync,
    Documentation,
    DocumentationItem,
    TaskType,
    TaskStatus,
    Task,
    TaskUnAssignment,
    DraftEncounter,
    SubjectProgramEligibility,
    MenuItem,
    UserSubjectAssignment
];

function migrateObjectTypeFieldToEmbedded(newDB, oldDB, schemaName, field, creatorFn) {
    console.log(`schema: ${schemaName}, field: ${field}`);
    newDB.objects(schemaName).forEach((newDbParentEntity) => {
        const oldFieldValue = oldDB.objects(schemaName).filtered(`uuid = "${newDbParentEntity.uuid}"`)[0][field];
        if (!_.isNil(oldFieldValue)) {
            newDbParentEntity[field] = creatorFn(oldFieldValue);
        }
    });
}

function migrateListTypeFieldToEmbedded(newDB, oldDB, schemaName, field, creatorFn) {
    console.log(`schema: ${schemaName}, field: ${field}`);
    newDB.objects(schemaName).forEach((newDbParentEntity) => {
        const newList = [];
        const oldFieldValues = oldDB.objects(schemaName).filtered(`uuid = "${newDbParentEntity.uuid}"`)[0][field];
        oldFieldValues.forEach((oldFieldValue) => {
            newList.push(creatorFn(oldFieldValue));
        });
        newDbParentEntity[field] = newList;
    });
}

function migrateEmbeddedObjects(oldDB, newDB,) {
    MetaDataService.forEachFormatField((field, schemaName) => {
        migrateObjectTypeFieldToEmbedded(newDB, oldDB, schemaName, field, (old) => {
            return {regex: old.regex, descriptionKey: old.descriptionKey}
        });
    });
    newDB.deleteModel("Format");

    MetaDataService.forEachKeyValueField((field, schemaName) => {
        migrateListTypeFieldToEmbedded(newDB, oldDB, schemaName, field, (old) => {
            return {key: old.key, value: old.value}
        });
    });
    newDB.deleteModel("KeyValue");

    MetaDataService.forEachChecklistItemStatusField((field, schemaName) => {
        migrateListTypeFieldToEmbedded(newDB, oldDB, schemaName, field, (old) => {
            return {
                state: old.state,
                from: {key: old.from.key, value: old.from.value},
                to: {key: old.to.key, value: old.to.value},
                color: old.color,
                displayOrder: old.displayOrder,
                start: old.start,
                end: old.end
            }
        });
    });

    console.log(`deleting model: ChecklistItemStatus`);
    newDB.deleteModel("ChecklistItemStatus");

    console.log(`deleting model: ProgramConfig`);
    newDB.deleteModel("ProgramConfig");

    console.log(`deleting model: VisitScheduleConfig`);
    newDB.deleteModel("VisitScheduleConfig");

    console.log(`deleting model: VisitScheduleInterval`);
    newDB.deleteModel("VisitScheduleInterval");

    console.log(`deleting model: StringKeyNumericValue`);
    newDB.deleteModel("StringKeyNumericValue")
}

const VersionWithEmbeddedMigrationProblem = 185;

function createRealmConfig() {
    return {
        shouldCompact: function (totalBytes, usedBytes) {
            const doCompact = (totalBytes / usedBytes) > 1.1;
            console.log("Should compact", totalBytes, usedBytes, doCompact);
            return doCompact;
        },
        //order is important, should be arranged according to the dependency
        schemaVersion: 200,
        onMigration: function (oldDB, newDB) {
            console.log("[AvniModels.Schema]", `Running migration with old schema version: ${oldDB.schemaVersion} and new schema version: ${newDB.schemaVersion}`);
            if (oldDB.schemaVersion === VersionWithEmbeddedMigrationProblem)
                throw new Error(`Update from schema version ${VersionWithEmbeddedMigrationProblem} is not allowed. Please uninstall and install app.`);

            if (oldDB.schemaVersion < 10) {
                const oldObjects = oldDB.objects("DecisionConfig");
                oldObjects.forEach((decisionConfig) => {
                    newDB.create(
                        ConfigFile.schema.name,
                        ConfigFile.create(decisionConfig.fileName, decisionConfig.decisionCode),
                        true
                    );
                });
            }
            if (oldDB.schemaVersion < 17) {
                const oldObjects = oldDB.objects("AddressLevel");
                const newObjects = newDB.objects("AddressLevel");

                for (let i = 0; i < oldObjects.length; i++) {
                    newObjects[i].name = oldObjects[i].title;
                }
            }
            if (oldDB.schemaVersion < 23) {
                const newObjects = newDB.objects("Individual");
                for (let i = 0; i < newObjects.length; i++) {
                    newObjects[i].registrationDate = new Date(2017, 0, 0);
                }
            }
            if (oldDB.schemaVersion < 30) {
                const newObjects = newDB.objects("Settings");
                for (let i = 0; i < newObjects.length; i++) {
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

            if (oldDB.schemaVersion < 145) {
                _.forEach(newDB.objects(Individual.schema.name), individual => {
                    const groups = newDB.objects(GroupSubject.schema.name).filtered("memberSubject.uuid = $0", individual.uuid).map(_.identity);
                    individual.groups = groups;
                });
            }

            if (oldDB.schemaVersion < 152) {
                _.forEach(newDB.objects(MediaQueue.schema.name), mediaQueueItem => {
                    mediaQueueItem.entityTargetField = "observations";
                });
                _.forEach(newDB.objects(SubjectType.schema.name), (sub) => {
                    sub.allowProfilePicture = false;
                });
            }

            if (oldDB.schemaVersion < 169) {
                const oldDraftSubjects = newDB.objects(DraftSubject.schema.name);
                newDB.delete(oldDraftSubjects);
            }

            if (oldDB.schemaVersion < 170) {
                const oldObjects = oldDB.objects("EntityApprovalStatus");
                const newObjects = newDB.objects("EntityApprovalStatus");

                for (let i = 0; i < oldObjects.length; i++) {
                    let entityApprovalStatus = oldObjects[i];
                    if (oldObjects[i].entityType === 'Subject') {
                        const subject = oldDB
                            .objects(Individual.schema.name)
                            .filtered("uuid = $0", entityApprovalStatus.entityUUID)[0];
                        if (subject) {
                            newObjects[i].entityTypeUuid = subject.subjectType.uuid;
                        }
                    } else if (oldObjects[i].entityType === 'ProgramEnrolment') {
                        const programEnrolment = oldDB
                            .objects(ProgramEnrolment.schema.name)
                            .filtered("uuid = $0", entityApprovalStatus.entityUUID)[0];
                        if (programEnrolment) {
                            newObjects[i].entityTypeUuid = programEnrolment.program.uuid;
                        }
                    } else if (oldObjects[i].entityType === 'ChecklistItem') {
                        const checklistItem = oldDB
                            .objects(ChecklistItem.schema.name)
                            .filtered("uuid = $0", entityApprovalStatus.entityUUID)[0];
                        if (checklistItem) {
                            newObjects[i].entityTypeUuid = checklistItem.checklist.programEnrolment.program.uuid;
                        }
                    } else if (oldObjects[i].entityType === 'Encounter') {
                        const encounter = oldDB
                            .objects(Encounter.schema.name)
                            .filtered("uuid = $0", entityApprovalStatus.entityUUID)[0];
                        if (encounter) {
                            newObjects[i].entityTypeUuid = encounter.encounterType.uuid;
                        }
                    } else if (oldObjects[i].entityType === 'ProgramEncounter') {
                        const programEncounter = oldDB
                            .objects(ProgramEncounter.schema.name)
                            .filtered("uuid = $0", entityApprovalStatus.entityUUID)[0];
                        if (programEncounter) {
                            newObjects[i].entityTypeUuid = programEncounter.encounterType.uuid;
                        }
                    }
                }
            }

            if (oldDB.schemaVersion < 173) {
                const entityApprovalStatuses = newDB.objects(EntityApprovalStatus.schema.name);
                entityApprovalStatuses.forEach((entityApprovalStatus) => {
                    let schemaName;
                    switch (entityApprovalStatus.entityType) {
                        case EntityApprovalStatus.entityType.Subject:
                            schemaName = SchemaNames.Individual;
                            break;
                        default:
                            schemaName = entityApprovalStatus.entityType;
                            break;
                    }
                    const entities = newDB.objects(schemaName).filtered("uuid = $0", entityApprovalStatus.entityUUID);
                    if (entities.length === 1) {
                        const entity = entities[0];
                        entity.approvalStatuses.push(entityApprovalStatus);
                        entity.latestEntityApprovalStatus = _.maxBy(entity.approvalStatuses, 'statusDateTime');
                    }
                });
                const entityApprovalStatusSyncStatus = newDB.objects(EntitySyncStatus.schema.name).filtered("entityName = $0", "EntityApprovalStatus");
                if (entityApprovalStatusSyncStatus[0]) {
                    newDB.delete(entityApprovalStatusSyncStatus);
                }
            }

            if (oldDB.schemaVersion < 175) {
                _.forEach(newDB.objects(SubjectType.schema.name), (sub) => {
                    sub.lastNameOptional = false;
                });
            }

            if (oldDB.schemaVersion < 176) {
                const entityApprovalStatuses = newDB.objects(EntityApprovalStatus.schema.name);
                entityApprovalStatuses.forEach((entityApprovalStatus) => {
                    let parentSchemaName;
                    switch (entityApprovalStatus.entityType) {
                        case EntityApprovalStatus.entityType.Subject:
                            parentSchemaName = SchemaNames.Individual;
                            break;
                        default:
                            parentSchemaName = entityApprovalStatus.entityType;
                            break;
                    }
                    const parentEntities = newDB.objects(parentSchemaName).filtered("uuid = $0", entityApprovalStatus.entityUUID);
                    if (parentEntities.length === 1) {
                        const parentEntity = parentEntities[0];
                        parentEntity.latestEntityApprovalStatus = _.maxBy(parentEntity.approvalStatuses, 'statusDateTime');
                    }
                });
            }
            if (oldDB.schemaVersion < 178) {
                const pushOnlyEntities = newDB
                    .objects(SchemaNames.EntitySyncStatus)
                    .filtered("entityName = 'EntityApprovalStatus' OR entityName = 'SyncTelemetry' OR entityName = 'VideoTelemetric' OR entityName = 'RuleFailureTelemetry'");

                newDB.delete(pushOnlyEntities);
            }
            if (oldDB.schemaVersion < 179) {
                _.forEach(newDB.objects(IdentifierAssignment.schema.name), (identifierAssignment) => {
                    if (identifierAssignment.individual !== null || identifierAssignment.programEnrolment !== null) {
                        identifierAssignment.used = true;
                    }
                });
            }
            if (oldDB.schemaVersion < 180) {
                General.logInfo("Migration180", "Execution started")
                const individualsOfInterest = newDB.objects(Individual.schema.name).filtered("lowestAddressLevel = null");
                individualsOfInterest && individualsOfInterest.forEach((individual) => {
                    General.logInfo("Migration180", "Deleting individual " + individual.uuid + " and related entities")
                    MigrationsHelper.deleteIndividual(individual, newDB);
                })
                General.logInfo("Migration180", "Execution completed")
            }
            if (oldDB.schemaVersion < 181) {
                _.forEach(newDB.objects(RuleFailureTelemetry.schema.name), (rft) => {
                    rft.sourceType = null;
                    rft.sourceId = null;
                    rft.entityType = null;
                    rft.entityId = null;
                });
            }
            if (oldDB.schemaVersion < 182) {
                _.forEach(newDB.objects(ReportCard.schema.name), (rc) => {
                    rc.nested = false;
                    rc.countOfCards = 1;
                });
            }
            if (newDB.schemaVersion < 183) {
                const newObjects = newDB.objects("DashboardCache");
                newDB.delete(newObjects);
            }
            if (oldDB.schemaVersion < 184) {
                migrateEmbeddedObjects(oldDB, newDB);
            }
            if (oldDB.schemaVersion < VersionWithEmbeddedMigrationProblem) {
                // removed migration code. keeping the version number in case this number is required for any checks later
            }
            if (oldDB.schemaVersion < 186) {
                // newDB.deleteModel("UserDefinedIndividualProperty");
                // newDB.deleteModel("ConfigFile");
                // newDB.deleteModel("Decision");
                // newDB.deleteModel("ProgramOutcome");
            }
            if (oldDB.schemaVersion < 189) {
                _.forEach(newDB.objects("SubjectType"), (subjectType) => {
                    if (!subjectType.settings) {
                        subjectType.settings = '{}'
                    }
                });
            }
            if (oldDB.schemaVersion < 190) {
                // PlaceHolder for SubjectType.User changes, so that people with previous version of client
                // are not able to use fastSync of version 190 and above
            }
            if (oldDB.schemaVersion < 191) {
                newDB.delete(newDB.objects("CustomDashboardCache"));
            }
            if (oldDB.schemaVersion < 197) {
                _.forEach(newDB.objects("ReportCard"), (reportCard) => {
                    if (reportCard.standardReportCardType &&
                        ['Last 24 hours registrations', 'Last 24 hours enrolments', 'Last 24 hours visits']
                            .includes(reportCard.standardReportCardType.name))
                        reportCard.standardReportCardInputRecentDurationJSON = JSON.stringify({
                            value: "1",
                            unit: "days"
                        });
                });

                _.forEach(newDB.objects("StandardReportCardType"), (standardReportCardType) => {
                    if (standardReportCardType.name === 'Last 24 hours registrations') {
                        standardReportCardType.description = 'Recent registrations';
                    }
                    if (standardReportCardType.name === 'Last 24 hours enrolments') {
                        standardReportCardType.description = 'Recent enrolments';
                    }
                    if (standardReportCardType.name === 'Last 24 hours visits') {
                        standardReportCardType.description = 'Recent visits';
                    }
                    standardReportCardType.type = _.replace(_.startCase(standardReportCardType.description), new RegExp(' ', 'g'), '');
                });

                //Reset MyDashboard cache because shape of filterJSON in cache has changed
                const dashboardCache = newDB.objects("DashboardCache");
                newDB.delete(dashboardCache);
            }
            if (oldDB.schemaVersion < 198) {
                const oldObjects = oldDB.objects(FormElementGroup.schema.name);
                const newObjects = newDB.objects(FormElementGroup.schema.name);
                // loop through all objects and set the name property in the
                // new schema to display property
                for (const objectIndex in oldObjects) {
                    const oldObject = oldObjects[objectIndex];
                    const newObject = newObjects[objectIndex];
                    if(!_.isEmpty(oldObject.display) && oldObject.name !== oldObject.display) {
                        newObject.name = oldObject.display;
                    }
                }
            }
            if (oldDB.schemaVersion < 199) {
                _.forEach(newDB.objects("Program"), (program) => {
                    program.showGrowthChart = _.toLower(program.name) === "child";
                });
            }
            if (oldDB.schemaVersion < 200) {
                _.forEach(newDB.objects("Concept"), (concept) => {
                    concept.mediaType = null;
                    concept.mediaUrl = null;
                });
            }
        },
    };
}

class EntityMappingConfig {
    static getInstance() {
        if (_.isNil(EntityMappingConfig.instance))
            EntityMappingConfig.instance = new EntityMappingConfig();
        return EntityMappingConfig.instance;
    }

    constructor() {
        this.realmConfig = createRealmConfig();
        this.realmConfig.schema = [];
        this.schemaEntityMap = new Map();
        this.mandatoryObjectSchemaProperties = new Map();
        entities.forEach((entity) => {
            if (_.isNil(this.schemaEntityMap.get(entity.schema.name))) {
                this.realmConfig.schema.push(entity.schema);
                this.schemaEntityMap.set(entity.schema.name, entity);
            }
        });
        this.realmConfig.schema.forEach((x) => {
            const nonOptionalObjectProperties = DefinedObjectSchema.getNonOptionalObjectProperties(x);
            this.mandatoryObjectSchemaProperties.set(x.name, nonOptionalObjectProperties);
        }, []);
    }

    getEntityClass(schemaName) {
        return this.schemaEntityMap.get(schemaName);
    }

    getRealmConfig() {
        return this.realmConfig;
    }

    getEntities() {
        return entities;
    }

    getSchemaVersion() {
        return this.getRealmConfig().schemaVersion;
    }

    getMandatoryObjectSchemaProperties(schemaName) {
        return this.mandatoryObjectSchemaProperties.get(schemaName);
    }
}

export default EntityMappingConfig;
