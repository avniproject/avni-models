import ReportCardFactory from "./ref/ReportCardFactory";
import StandardReportCardTypeFactory from "./ref/StandardReportCardTypeFactory";
import SubjectTypeFactory from "./ref/SubjectTypeFactory";
import EncounterTypeFactory from "./ref/EncounterTypeFactory";
import StandardReportCardType from "../src/StandardReportCardType";
import ReportCard from "../src/ReportCard";
import AttendanceType from "../src/AttendanceType";
import Dashboard from "../src/Dashboard";
import EncounterType from "../src/EncounterType";
import SubjectType from "../src/SubjectType";
import EntityMappingConfig from "../src/Schema";
import EntitySyncStatus from "../src/EntitySyncStatus";
import EntityMetaData from "../src/EntityMetaData";
import _ from "lodash";
import {assert} from 'chai';

it('is subject type filter supported', function () {
    const approvedType = StandardReportCardTypeFactory.create({name: 'Approved', type: StandardReportCardType.types.Approved});
    const reportCard = ReportCardFactory.create({standardReportCardType: approvedType});
    assert.equal(reportCard.isSubjectTypeFilterSupported(), false);
    reportCard.standardReportCardType = StandardReportCardTypeFactory.create({name: 'Scheduled visits', type: StandardReportCardType.types.ScheduledVisits});
    assert.equal(reportCard.isSubjectTypeFilterSupported(), true);
});

describe('ReportCard.fromResource — MarkAttendance', () => {
    const ATTENDANCE_TYPE_UUID = 'at-uuid-1';

    function buildEntityService(attendanceType) {
        return {
            findByKey: () => null,
            findByUUID: (uuid, schemaName) => {
                if (schemaName === AttendanceType.schema.name && uuid === ATTENDANCE_TYPE_UUID) {
                    return attendanceType;
                }
                return null;
            }
        };
    }

    function buildResource(actionDetail) {
        return {
            uuid: 'rc-1',
            name: 'rc',
            colour: '#fff',
            voided: false,
            standardReportCardInputSubjectTypes: [],
            standardReportCardInputPrograms: [],
            standardReportCardInputEncounterTypes: [],
            action: ReportCard.actionTypes.MarkAttendance,
            actionDetail: actionDetail,
            _links: {}
        };
    }

    it('resolves actionDetailAttendanceType via entityService when attendanceTypeUUID is present', () => {
        const attendanceType = new AttendanceType();
        attendanceType.uuid = ATTENDANCE_TYPE_UUID;
        attendanceType.name = 'Daily';

        const reportCard = ReportCard.fromResource(
            buildResource({attendanceTypeUUID: ATTENDANCE_TYPE_UUID}),
            buildEntityService(attendanceType)
        );

        assert.isTrue(reportCard.isActionMarkAttendance());
        assert.isNotNull(reportCard.actionDetailAttendanceType);
        assert.equal(reportCard.actionDetailAttendanceType.uuid, ATTENDANCE_TYPE_UUID);
    });

    it('leaves actionDetailAttendanceType unset when attendanceTypeUUID is absent', () => {
        const reportCard = ReportCard.fromResource(
            buildResource({}),
            buildEntityService(null)
        );

        assert.isNotOk(reportCard.actionDetailAttendanceType);
    });
});

describe('ReportCard.fromResource — OpenDashboard', () => {
    const ATTENDANCE_TYPE_UUID = 'at-uuid-1';
    const SUBJECT_TYPE_UUID = 'st-uuid-1';
    const ENCOUNTER_TYPE_UUID = 'et-uuid-1';

    // standIns maps a schema name to what both lookups return for it. Any other schema gets null.
    // Both lookups record the schema names they are asked for, so a test can see what fromResource looked up.
    function buildEntityService(standIns = {}) {
        const asked = {findByKey: [], findByUUID: []};
        return {
            asked,
            findByKey: (key, value, schemaName) => {
                asked.findByKey.push(schemaName);
                return standIns[schemaName] || null;
            },
            findByUUID: (uuid, schemaName) => {
                asked.findByUUID.push(schemaName);
                return standIns[schemaName] || null;
            }
        };
    }

    function buildResource(action, actionDetail) {
        return {
            uuid: 'rc-1',
            name: 'rc',
            colour: '#fff',
            voided: false,
            standardReportCardInputSubjectTypes: [],
            standardReportCardInputPrograms: [],
            standardReportCardInputEncounterTypes: [],
            action: action,
            actionDetail: actionDetail,
            _links: {}
        };
    }

    it('declares the target as an optional string', () => {
        assert.deepEqual(ReportCard.schema.properties.actionDetailDashboardUUID, {type: "string", optional: true});
    });

    it('stores the target dashboard uuid as a plain string without looking the dashboard up', () => {
        const entityService = buildEntityService();

        const reportCard = ReportCard.fromResource(
            buildResource(ReportCard.actionTypes.OpenDashboard, {dashboardUUID: 'dashboard-uuid-1'}),
            entityService
        );

        assert.strictEqual(reportCard.actionDetailDashboardUUID, 'dashboard-uuid-1');
        // Read the stored object too, so a misspelt key shared by the getter and setter still fails.
        assert.strictEqual(reportCard.that.actionDetailDashboardUUID, 'dashboard-uuid-1');
        assert.isTrue(reportCard.isActionOpenDashboard());
        assert.notInclude(entityService.asked.findByKey, Dashboard.schema.name);
        assert.notInclude(entityService.asked.findByUUID, Dashboard.schema.name);
    });

    it('leaves the target null when the action detail carries none', () => {
        const reportCard = ReportCard.fromResource(
            buildResource(ReportCard.actionTypes.OpenDashboard, {}),
            buildEntityService()
        );

        assert.isNull(reportCard.actionDetailDashboardUUID);
    });

    it('stores no target for a card with another action', () => {
        const attendanceType = new AttendanceType();
        attendanceType.uuid = ATTENDANCE_TYPE_UUID;
        attendanceType.name = 'Daily';

        const markAttendance = ReportCard.fromResource(
            buildResource(ReportCard.actionTypes.MarkAttendance, {attendanceTypeUUID: ATTENDANCE_TYPE_UUID}),
            buildEntityService({[AttendanceType.schema.name]: attendanceType})
        );

        assert.isNull(markAttendance.actionDetailDashboardUUID);
        assert.isNotNull(markAttendance.actionDetailAttendanceType);
        assert.strictEqual(markAttendance.actionDetailAttendanceType.uuid, ATTENDANCE_TYPE_UUID);

        let viewSubjectProfile;
        assert.doesNotThrow(() => {
            viewSubjectProfile = ReportCard.fromResource(
                buildResource(ReportCard.actionTypes.ViewSubjectProfile, null),
                buildEntityService()
            );
        });
        assert.isNull(viewSubjectProfile.actionDetailDashboardUUID);
    });

    it('clears the target when a card arrives with no action details', () => {
        // The server sends no action details for View subject profile or a card with no action, and the phone saves only
        // the fields a card carries. The target must arrive as null for a target from an earlier sync to be overwritten.
        [ReportCard.actionTypes.ViewSubjectProfile, null].forEach((action) => {
            const reportCard = ReportCard.fromResource(buildResource(action, null), buildEntityService());

            assert.isNull(reportCard.that.actionDetailDashboardUUID, `action: ${action}`);
        });
    });

    it('keeps the Do visit details', () => {
        const subjectType = SubjectTypeFactory.create({uuid: SUBJECT_TYPE_UUID, name: 'Individual'});
        const encounterType = EncounterTypeFactory.create({uuid: ENCOUNTER_TYPE_UUID, name: 'Home visit'});

        const reportCard = ReportCard.fromResource(
            buildResource(ReportCard.actionTypes.DoVisit, {
                subjectTypeUUID: SUBJECT_TYPE_UUID,
                encounterTypeUUID: ENCOUNTER_TYPE_UUID,
                visitType: 'Scheduled'
            }),
            buildEntityService({
                [SubjectType.schema.name]: subjectType,
                [EncounterType.schema.name]: encounterType
            })
        );

        assert.isNotNull(reportCard.actionDetailSubjectType);
        assert.strictEqual(reportCard.actionDetailSubjectType.uuid, SUBJECT_TYPE_UUID);
        assert.isNotNull(reportCard.actionDetailEncounterType);
        assert.strictEqual(reportCard.actionDetailEncounterType.uuid, ENCOUNTER_TYPE_UUID);
        assert.strictEqual(reportCard.actionDetailVisitType, 'Scheduled');
        assert.isNull(reportCard.actionDetailDashboardUUID);
    });

    it('isActionOpenDashboard is true only for Open dashboard', () => {
        ['ViewSubjectProfile', 'DoVisit', 'MarkAttendance', 'OpenDashboard', null].forEach((action) => {
            const reportCard = new ReportCard();
            reportCard.action = action;

            assert.strictEqual(reportCard.isActionOpenDashboard(), action === 'OpenDashboard', `action: ${action}`);
        });
    });
});

describe('Schema.onMigration — ReportCard sync marker', () => {
    const realmConfig = EntityMappingConfig.getInstance().getRealmConfig();
    const OCTOBER_FIRST = '2026-10-01T00:00:00.000Z';
    const REALLY_OLD = EntitySyncStatus.REALLY_OLD_DATE.toISOString();

    const marker = (entityName, loadedSince = OCTOBER_FIRST) => ({entityName, loadedSince: new Date(loadedSince)});

    // The markers as name -> loadedSince, in ISO strings, so a failure shows which markers moved and to when.
    const loadedSinceByName = (markers) =>
        _.mapValues(_.keyBy(markers, 'entityName'), (m) => m.loadedSince && m.loadedSince.toISOString());

    // Runs the migration for a phone upgrading from the given schema version, against a stand-in for the new database
    // that holds only the given sync markers. Steps added after 221 also run against this stand-in, so a later step
    // that needs .filtered() or oldDB must extend it.
    // onMigration logs a line on every call, so console.log is held back for the call and restored in finally.
    function migrateFrom(oldSchemaVersion, markers) {
        const newDB = {
            schemaVersion: 221,
            objects: (schemaName) => schemaName === EntitySyncStatus.schema.name ? markers : []
        };
        const realLog = console.log;
        console.log = () => {};

        try {
            realmConfig.onMigration({schemaVersion: oldSchemaVersion}, newDB);
        } finally {
            console.log = realLog;
        }
    }

    it('the version 221 migration moves only the card sync marker back', () => {
        assert.isAtLeast(realmConfig.schemaVersion, 221);
        const markers = [
            marker('ReportCard'),
            marker('Dashboard'),
            marker('CustomCardConfig'),
            marker('StandardReportCardType')
        ];

        migrateFrom(220, markers);

        assert.deepEqual(loadedSinceByName(markers), {
            ReportCard: REALLY_OLD,
            Dashboard: OCTOBER_FIRST,
            CustomCardConfig: OCTOBER_FIRST,
            StandardReportCardType: OCTOBER_FIRST
        });
    });

    it('the version 221 migration leaves a card marker already at 1900 there', () => {
        const markers = [marker('ReportCard', REALLY_OLD)];

        assert.doesNotThrow(() => migrateFrom(220, markers));

        assert.deepEqual(loadedSinceByName(markers), {ReportCard: REALLY_OLD});
    });

    it('the version 221 migration does nothing when there is no card marker', () => {
        const markers = [marker('Dashboard'), marker('CustomCardConfig'), marker('StandardReportCardType')];

        assert.doesNotThrow(() => migrateFrom(220, markers));

        assert.deepEqual(loadedSinceByName(markers), {
            Dashboard: OCTOBER_FIRST,
            CustomCardConfig: OCTOBER_FIRST,
            StandardReportCardType: OCTOBER_FIRST
        });
    });

    it('the version 221 migration leaves the card marker alone for a phone already at 221', () => {
        // Pins the step's guard for the day a later version exists: a phone at 221 must not fetch every card again.
        const markers = [marker('ReportCard')];

        migrateFrom(221, markers);

        assert.deepEqual(loadedSinceByName(markers), {ReportCard: OCTOBER_FIRST});
    });

    it('names the card sync marker the way the version 221 migration matches it', () => {
        // Found by its class, not by its name, because the name is what is under test. The phone writes
        // entity.entityName as the marker's name (avni-client EntitySyncStatusService.setup).
        const cardEntries = EntityMetaData.model().filter((entry) => entry.entityClass === ReportCard);

        assert.lengthOf(cardEntries, 1);
        assert.strictEqual(cardEntries[0].entityName, 'ReportCard');
    });
});
