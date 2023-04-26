import FormMapping from '../../src/application/FormMapping';
import Form from '../../src/application/Form';
import SubjectType from '../../src/SubjectType';

class FormMappingFactory {
  static createProgramEncounterTypeMapping({uuid, encounterTypeUUID, programUUID, subjectTypeUUID}) {
    const formMapping = new FormMapping();
    const form = new Form();
    form.formType = Form.formTypes.ProgramEncounter;
    formMapping.form = form;
    formMapping.uuid = uuid;
    formMapping.programUUID = programUUID;
    formMapping.encounterTypeUUID = encounterTypeUUID;

    const subjectType = new SubjectType();
    subjectType.uuid = subjectTypeUUID;
    formMapping.subjectType = subjectType;
    return formMapping;
  }

  static createProgramEnrolmentTypeMapping({uuid, subjectTypeUUID, programUUID}) {
    const formMapping = new FormMapping();
    const form = new Form();
    form.formType = Form.formTypes.ProgramEnrolment;
    formMapping.form = form;
    formMapping.uuid = uuid;
    formMapping.programUUID = programUUID;

    const subjectType = new SubjectType();
    subjectType.uuid = subjectTypeUUID;
    formMapping.subjectType = subjectType;
    return formMapping;
  }
}

export default FormMappingFactory;
