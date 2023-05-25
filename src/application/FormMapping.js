import ResourceUtil from "../utility/ResourceUtil";
import Form from "./Form";
import General from "../utility/General";
import SubjectType from "../SubjectType";
import TaskType from "../task/TaskType";
import BaseEntity from "../BaseEntity";
import SchemaNames from "../SchemaNames";

class FormMapping extends BaseEntity {
  static schema = {
    name: SchemaNames.FormMapping,
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

   constructor(that = null) {
    super(that);
  }

  get form() {
      return this.toEntity("form", Form);
  }

  set form(x) {
      this.that.form = this.fromObject(x);
  }

  get subjectType() {
      return this.toEntity("subjectType", SubjectType);
  }

  set subjectType(x) {
      this.that.subjectType = this.fromObject(x);
  }

  get entityUUID() {
      return this.that.entityUUID;
  }

  set entityUUID(x) {
      this.that.entityUUID = x;
  }

  get observationsTypeEntityUUID() {
      return this.that.observationsTypeEntityUUID;
  }

  set observationsTypeEntityUUID(x) {
      this.that.observationsTypeEntityUUID = x;
  }

  get enableApproval() {
      return this.that.enableApproval;
  }

  set enableApproval(x) {
      this.that.enableApproval = x;
  }

  get taskType() {
      return this.toEntity("taskType", TaskType);
  }

  set taskType(x) {
      this.that.taskType = this.fromObject(x);
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
    const form = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "formUUID"),
      Form.schema.name
    );
    const subjectType = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "subjectTypeUUID"),
      SubjectType.schema.name
    );
    const taskType = entityService.findByKey(
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

  getSchemaAndFilterQuery() {
    switch (this.form.formType) {
      case Form.formTypes.IndividualProfile :
        return {schema: "Individual", filterQuery: `subjectType.uuid = '${this.subjectType.uuid}'`};
      case Form.formTypes.IndividualEncounterCancellation:
        return {
          schema: "Encounter",
          filterQuery: `individual.subjectType.uuid = '${this.subjectType.uuid}' and encounterType.uuid = '${this.observationsTypeEntityUUID}' and cancelDateTime <> null`
        };
      case Form.formTypes.Encounter :
        return {
          schema: "Encounter",
          filterQuery: `individual.subjectType.uuid = '${this.subjectType.uuid}' and encounterType.uuid = '${this.observationsTypeEntityUUID}' and cancelDateTime = null`
        };
      case Form.formTypes.ProgramEnrolment:
        return {
          schema: "ProgramEnrolment",
          filterQuery: `individual.subjectType.uuid = '${this.subjectType.uuid}' and program.uuid = '${this.entityUUID}' and programExitDateTime = null`
        };
      case Form.formTypes.ProgramExit:
        return {
          schema: "ProgramEnrolment",
          filterQuery: `individual.subjectType.uuid = '${this.subjectType.uuid}' and program.uuid = '${this.entityUUID}' and programExitDateTime <> null`
        };
      case Form.formTypes.ProgramEncounter:
        return {
          schema: "ProgramEncounter",
          filterQuery: `programEnrolment.individual.subjectType.uuid = '${this.subjectType.uuid}' and programEnrolment.program.uuid =  '${this.entityUUID}' and encounterType.uuid = '${this.observationsTypeEntityUUID}' and cancelDateTime = null`
        };
      case Form.formTypes.ProgramEncounterCancellation:
        return {
          schema: "ProgramEncounter",
          filterQuery: `programEnrolment.individual.subjectType.uuid = '${this.subjectType.uuid}' and programEnrolment.program.uuid =  '${this.entityUUID}' and encounterType.uuid = '${this.observationsTypeEntityUUID}' and cancelDateTime <> null`
        };
      case Form.formTypes.ChecklistItem :
        return {schema: "ChecklistItem", filterQuery: ''};
    }
  }

  getEntityNameAndEntityTypeUUID() {
    const formTypes = Form.formTypes;
    switch (this.form.formType) {
      case formTypes.IndividualProfile :
        return {entityName: "Individual", entityTypeUuid: this.subjectType.uuid};
      case formTypes.Encounter:
      case formTypes.IndividualEncounterCancellation:
        return {entityName:"Encounter", entityTypeUuid: this.observationsTypeEntityUUID};
      case formTypes.ProgramEncounter:
      case formTypes.ProgramEncounterCancellation:
        return {entityName:"ProgramEncounter", entityTypeUuid: this.observationsTypeEntityUUID};
      case formTypes.ProgramEnrolment:
      case formTypes.ProgramExit:
        return {entityName:"ProgramEnrolment", entityTypeUuid: this.entityUUID};
      default:
        return {entityName:"", entityTypeUuid: ""};
    }
  }

  get programUUID() {
    return this.entityUUID;
  }

  set programUUID(x) {
    this.entityUUID = x;
  }

  get encounterTypeUUID() {
    return this.observationsTypeEntityUUID;
  }

  set encounterTypeUUID(x) {
    this.observationsTypeEntityUUID = x;
  }

  // created for legacy reasons because the web app doesn't construct the domain model in the same way
  get subjectTypeUUID() {
    return this.subjectType.uuid;
  }
  get formType() {
    return this.form.formType;
  }
}

export default FormMapping;
