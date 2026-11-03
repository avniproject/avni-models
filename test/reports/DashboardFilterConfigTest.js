import {assert} from 'chai';
import {CustomFilter, DashboardFilterConfig} from "../../src";
import SubjectTypeFactory from "../ref/SubjectTypeFactory";
import ProgramFactory from "../ref/ProgramFactory";
import TestConceptFactory from "../ref/TestConceptFactory";

describe('DashboardFilterConfigTest', () => {
  it('is valid', () => {
    const dashboardFilterConfig = new DashboardFilterConfig();
    dashboardFilterConfig.setType(CustomFilter.type.Concept);
    dashboardFilterConfig.observationBasedFilter.concept = TestConceptFactory.create({uuid: "C1"});
    dashboardFilterConfig.observationBasedFilter.setScope(CustomFilter.scope.Registration);
    assert.equal(dashboardFilterConfig.isValid(), true);
  });

  describe('preset', () => {
    const patient = SubjectTypeFactory.create({uuid: 'st-patient', name: 'Patient'});
    const household = SubjectTypeFactory.create({uuid: 'st-household', name: 'Household'});
    const tb = ProgramFactory.create({uuid: 'p-tb', name: 'TB'});

    const subjectTypeFilter = (presetSubjectType, presetProgram) => {
      const config = new DashboardFilterConfig();
      config.setType(CustomFilter.type.SubjectType);
      config.presetSubjectType = presetSubjectType;
      config.presetProgram = presetProgram;
      return config;
    };

    const wire = (config) => JSON.parse(JSON.stringify(config.toServerRequest()));

    it('copies the preset subject type and program', () => {
      const original = subjectTypeFilter(patient, tb);
      const copy = original.clone();
      assert.strictEqual(copy.presetSubjectType, original.presetSubjectType);
      assert.strictEqual(copy.presetProgram, original.presetProgram);
    });

    it("changing the copy's preset leaves the original unchanged", () => {
      const original = subjectTypeFilter(patient, tb);
      const copy = original.clone();
      assert.strictEqual(copy.presetSubjectType, patient);
      assert.strictEqual(copy.presetProgram, tb);
      copy.presetSubjectType = household;
      copy.presetProgram = null;
      assert.strictEqual(original.presetSubjectType, patient);
      assert.strictEqual(original.presetProgram, tb);
    });

    it('keeps the preset through repeated copies', () => {
      const copy = subjectTypeFilter(patient, tb).clone().clone();
      assert.strictEqual(copy.presetSubjectType, patient);
      assert.strictEqual(copy.presetProgram, tb);
    });

    it('sends the preset subject type and program of a Subject Type filter', () => {
      assert.deepEqual(wire(subjectTypeFilter(patient, tb)), {
        type: 'SubjectType',
        widget: null,
        presetSubjectTypeUUID: 'st-patient',
        presetProgramUUID: 'p-tb'
      });
    });

    it('sends a preset subject type with no program', () => {
      assert.deepEqual(wire(subjectTypeFilter(patient, undefined)), {
        type: 'SubjectType',
        widget: null,
        presetSubjectTypeUUID: 'st-patient'
      });
    });

    it('sends no preset value for a cleared preset', () => {
      const config = subjectTypeFilter(null, null);
      assert.doesNotThrow(() => config.toServerRequest());
      const request = wire(config);
      assert.notExists(request.presetSubjectTypeUUID);
      assert.notExists(request.presetProgramUUID);
    });

    it('a Subject Type filter with no preset sends what it sends today', () => {
      const viaSetType = new DashboardFilterConfig();
      viaSetType.setType(CustomFilter.type.SubjectType);
      assert.equal(JSON.stringify(viaSetType.toServerRequest()), '{"type":"SubjectType","widget":null}');

      const viaAssignment = new DashboardFilterConfig();
      viaAssignment.type = CustomFilter.type.SubjectType;
      assert.equal(JSON.stringify(viaAssignment.toServerRequest()), '{"type":"SubjectType"}');
    });

    it("keeps the preset out of the filter's subject type", () => {
      const config = subjectTypeFilter(patient, tb);
      const request = config.toServerRequest();
      assert.isUndefined(request.subjectTypeUUID);
      assert.isFalse(config.requiresSpecificSubjectType());
    });

    it('other filter types send no preset', () => {
      const otherTypes = Object.values(CustomFilter.getDashboardFilterTypes())
        .filter((type) => type !== CustomFilter.type.SubjectType);
      assert.equal(otherTypes.length, 9);
      otherTypes.forEach((type) => {
        const config = new DashboardFilterConfig();
        config.setType(type);
        if (type === CustomFilter.type.Concept) {
          config.observationBasedFilter.concept = TestConceptFactory.create({uuid: 'c-1'});
        }
        if (type === CustomFilter.type.GroupSubject) {
          config.groupSubjectTypeFilter.subjectType = patient;
        }
        config.presetSubjectType = patient;
        config.presetProgram = tb;
        const request = config.toServerRequest();
        assert.notProperty(request, 'presetSubjectTypeUUID', type);
        assert.notProperty(request, 'presetProgramUUID', type);
      });
    });

    it('a filter switched to another type sends no preset', () => {
      const config = subjectTypeFilter(patient, tb);
      config.setType(CustomFilter.type.Gender);
      const request = config.toServerRequest();
      assert.notProperty(request, 'presetSubjectTypeUUID');
      assert.notProperty(request, 'presetProgramUUID');
    });
  });
});
