import _ from "lodash";
import {Form} from 'openchs-models';

class MetaDataService {
  static getProgramFormMappings(formMappings) {
    return _.filter(
      formMappings,
      formMapping => formMapping.formType === Form.formTypes.ProgramEnrolment
    );
  }

  static getGeneralEncounterFormMappings(formMappings) {
    return _.filter(
      formMappings,
      formMapping =>
        formMapping.formType === Form.formTypes.Encounter ||
        formMapping.formType === Form.formTypes.IndividualEncounterCancellation
    );
  }

  static getProgramEncounterFormMappings(formMappings) {
    return _.filter(
      formMappings,
      formMapping =>
        formMapping.formType === Form.formTypes.ProgramEncounter ||
        formMapping.formType === Form.formTypes.ProgramEncounterCancellation
    );
  }

  static getProgramsForSubjectType(allPrograms, subjectType, formMappings) {
    if (_.isNil(subjectType)) return allPrograms;

    const programFormMappingsForSubjectType = _.filter(formMappings, formMapping =>
                                                    (formMapping.subjectTypeUUID === subjectType.uuid) && (formMapping.formType === Form.formTypes.ProgramEnrolment));
    return _.intersectionWith(allPrograms, programFormMappingsForSubjectType, (p, fm) => p.uuid === fm.programUUID);
  }

  static getEncounterTypesForSubjectType(allEncounterTypes, subjectType, formMappings) {
    if (_.isNil(subjectType)) return allEncounterTypes;

    const generalEncounterFormMappingsForSubjectType = _.filter(
      this.getGeneralEncounterFormMappings(formMappings),
      formMapping => formMapping.subjectTypeUUID === subjectType.uuid
    );
    return generalEncounterFormMappingsForSubjectType.map(x =>
      _.some(allEncounterTypes, et => et.uuid === x.encounterTypeUUID)
    );
  }

  static getEncounterTypesForPrograms(allEncounterTypes, programs, formMappings) {
    const programEncounterTypeMappings = MetaDataService.getProgramEncounterFormMappings(formMappings);
    const encounterTypeMappingsForPrograms = _.intersectionWith(programEncounterTypeMappings, programs, (etMapping, program) => etMapping.programUUID === program.uuid);
    return encounterTypeMappingsForPrograms.map((x) => _.find(allEncounterTypes, (et) => et.uuid === x.encounterTypeUUID));
  }

  static getEncounterTypes_For_SubjectTypeAndPrograms(
    allEncounterTypes,
    subjectType,
    programs,
    formMappings
  ) {
    if (_.isEmpty(programs))
      return MetaDataService.getEncounterTypesForSubjectType(allEncounterTypes, subjectType, formMappings);

    return MetaDataService.getEncounterTypesForPrograms(allEncounterTypes, programs, formMappings);
  }

  static getPossibleGroupSubjectTypesFor(subjectTypes, subjectType) {
    return _.isNil(subjectType) ?
      _.filter(subjectTypes, (x) => x.group) :
      _.filter(subjectTypes, (x) => (x.uuid !== subjectType.uuid) && (x.group));
  }
}

export default MetaDataService;
