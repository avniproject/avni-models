import ResourceUtil from "../utility/ResourceUtil";
import Form from "./Form";
import General from "../utility/General";
import SubjectType from "../SubjectType";
import Individual from "../Individual";
import Encounter from "../Encounter";
import ProgramEnrolment from "../ProgramEnrolment";
import ProgramEncounter from "../ProgramEncounter";
import ChecklistItem from "../ChecklistItem";
import TaskType from "../task/TaskType";
import BaseEntity from "../BaseEntity";

class FormMapping extends BaseEntity {
  static schema = {
    name: "FormMapping",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      form: "Form",
      subjectType: {type: "SubjectType", optional: true},
      entityUUID: { type: "string", optional: true },
      observationsTypeEntityUUID: { type: "string", optional: true },
      voided: { type: "bool", default: false },
      enableApproval: { type: "bool", default: false },
      taskType: {type: "TaskType", optional: true}
    },
  };

  mapNonPrimitives(realmObject, entityMapper) {
    this.subjectType = entityMapper.toEntity(realmObject.subjectType, SubjectType);
    this.taskType = entityMapper.toEntity(realmObject.taskType, TaskType);
  }

  static create(uuid, form, entityUUID, observationsTypeEntityUUID) {
    let formMapping = new FormMapping();
    formMapping.uuid = uuid;
    formMapping.form = form;
    formMapping.entityUUID = entityUUID;
    formMapping.observationsTypeEntityUUID = observationsTypeEntityUUID;
    return formMapping;
  }

  static fromResource(resource, entityService) {
    const form = entityService.findEntity(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "formUUID"),
      Form.schema.name
    );
    const subjectType = entityService.findEntity(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "subjectTypeUUID"),
      SubjectType.schema.name
    );
    const taskType = entityService.findEntity(
        "uuid",
        ResourceUtil.getUUIDFor(resource, "taskTypeUUID"),
        TaskType.schema.name
    );
    const formMapping = General.assignFields(resource, new FormMapping(), ["uuid", "voided", "enableApproval"]);
    formMapping.entityUUID = ResourceUtil.getUUIDFor(resource, "entityUUID");
    formMapping.observationsTypeEntityUUID = ResourceUtil.getUUIDFor(
      resource,
      "observationsTypeEntityUUID"
    );
    formMapping.form = form;
    formMapping.subjectType = subjectType;
    formMapping.taskType = taskType;

    return formMapping;
  }

  static parentAssociations = () =>
    new Map([
      [Form, "formUUID"],
      [SubjectType, "subjectTypeUUID"],
    ]);

  getSchemaAndFilterQuery() {
    switch (this.form.formType) {
      case Form.formTypes.IndividualProfile :
        return {schema: Individual.schema.name, filterQuery: `subjectType.uuid = '${this.subjectType.uuid}'`};
      case Form.formTypes.IndividualEncounterCancellation:
        return {
          schema: Encounter.schema.name,
          filterQuery: `individual.subjectType.uuid = '${this.subjectType.uuid}' and encounterType.uuid = '${this.observationsTypeEntityUUID}' and cancelDateTime <> null`
        };
      case Form.formTypes.Encounter :
        return {
          schema: Encounter.schema.name,
          filterQuery: `individual.subjectType.uuid = '${this.subjectType.uuid}' and encounterType.uuid = '${this.observationsTypeEntityUUID}' and cancelDateTime = null`
        };
      case Form.formTypes.ProgramEnrolment:
        return {
          schema: ProgramEnrolment.schema.name,
          filterQuery: `individual.subjectType.uuid = '${this.subjectType.uuid}' and program.uuid = '${this.entityUUID}' and programExitDateTime = null`
        };
      case Form.formTypes.ProgramExit:
        return {
          schema: ProgramEnrolment.schema.name,
          filterQuery: `individual.subjectType.uuid = '${this.subjectType.uuid}' and program.uuid = '${this.entityUUID}' and programExitDateTime <> null`
        };
      case Form.formTypes.ProgramEncounter:
        return {
          schema: ProgramEncounter.schema.name,
          filterQuery: `programEnrolment.individual.subjectType.uuid = '${this.subjectType.uuid}' and programEnrolment.program.uuid =  '${this.entityUUID}' and encounterType.uuid = '${this.observationsTypeEntityUUID}' and cancelDateTime = null`
        };
      case Form.formTypes.ProgramEncounterCancellation:
        return {
          schema: ProgramEncounter.schema.name,
          filterQuery: `programEnrolment.individual.subjectType.uuid = '${this.subjectType.uuid}' and programEnrolment.program.uuid =  '${this.entityUUID}' and encounterType.uuid = '${this.observationsTypeEntityUUID}' and cancelDateTime <> null`
        };
      case Form.formTypes.ChecklistItem :
        return {schema: ChecklistItem.schema.name, filterQuery: ''};
    }
  }
}

export default FormMapping;
