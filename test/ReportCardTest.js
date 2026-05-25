import ReportCardFactory from "./ref/ReportCardFactory";
import StandardReportCardTypeFactory from "./ref/StandardReportCardTypeFactory";
import StandardReportCardType from "../src/StandardReportCardType";
import ReportCard from "../src/ReportCard";
import AttendanceType from "../src/AttendanceType";
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
