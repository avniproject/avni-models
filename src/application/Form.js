import General from "../utility/General";
import BaseEntity from "../BaseEntity";
import FormElementGroup from "./FormElementGroup";
import _ from "lodash";
import FormMapping from "./FormMapping";
import DraftSubject from "../draft/DraftSubject";

class Form {
  static schema = {
    name: "Form",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      formType: "string",
      name: "string",
      formElementGroups: { type: "list", objectType: "FormElementGroup" },
      decisionRule: { type: "string", optional: true },
      visitScheduleRule: { type: "string", optional: true },
      validationRule: { type: "string", optional: true },
      checklistsRule: { type: "string", optional: true },
    },
  };

  static safeInstance() {
    const form = new Form();
    form.formElementGroups = [];
    return form;
  }

  removeFormElement(formElementName) {
    this.formElementGroups = _.map(this.formElementGroups, (formElementGroup) => {
      return formElementGroup.removeFormElement(formElementName);
    });
    return this;
  }

  static fromResource(resource, entityService) {
    if (resource.formType === this.formTypes.IndividualProfile) {
      this.deleteOutOfSyncDrafts(entityService, resource.uuid);
    }
    return General.assignFields(resource, new Form(), [
      "uuid",
      "name",
      "formType",
      "decisionRule",
      "visitScheduleRule",
      "validationRule",
      "checklistsRule",
    ]);
  }

  static deleteOutOfSyncDrafts(entityService, formUUID) {
    const formMappings = entityService.findAllByCriteria(`form.uuid = '${formUUID}'`, FormMapping.schema.name);
    _.forEach(formMappings, ({subjectType}) => {
      const outOfSyncDrafts = entityService.findAll(DraftSubject.schema.name)
          .filtered(`subjectType = $0`, subjectType);
      entityService.deleteAll(outOfSyncDrafts);
    })
  }

  static childAssociations = () => new Map([[FormElementGroup, "formElementGroups"]]);

  static merge = () => BaseEntity.mergeOn("formElementGroups");

  static associateChild(child, childEntityClass, childResource, entityService) {
    let form = BaseEntity.getParentEntity(
      entityService,
      childEntityClass,
      childResource,
      "formUUID",
      Form.schema.name
    );
    form = General.pick(form, ["uuid"], ["formElementGroups"]);
    if (childEntityClass === FormElementGroup) {
      BaseEntity.addNewChild(child, form.formElementGroups);
    } else throw `${childEntityClass.name} not support by Form`;
    return form;
  }

  addFormElementGroup(formElementGroup) {
    formElementGroup.form = this;
    this.formElementGroups.push(formElementGroup);
  }

  formElementGroupAt(displayOrder) {
    return _.find(
      this.formElementGroups,
      (formElementGroup) => formElementGroup.displayOrder === displayOrder
    );
  }

  getNextFormElement(displayOrder) {
    const currentIndex = _.findIndex(
      this.getFormElementGroups(),
      (feg) => feg.displayOrder === displayOrder
    );
    return this.getFormElementGroups()[currentIndex + 1];
  }

  getFormElementsOfType(type) {
    return _.reduce(
      this.formElementGroups,
      (idElements, feg) => _.concat(idElements, feg.getFormElementsOfType(type)),
      []
    );
  }

  getPrevFormElement(displayOrder) {
    const currentIndex = _.findIndex(
      this.getFormElementGroups(),
      (feg) => feg.displayOrder === displayOrder
    );
    return this.getFormElementGroups()[currentIndex - 1];
  }

  nonVoidedFormElementGroups() {
    return _.filter(this.formElementGroups, (formElementGroup) => !formElementGroup.voided);
  }

  getFormElementGroups() {
    return _.sortBy(this.nonVoidedFormElementGroups(), (feg) => feg.displayOrder);
  }

  getLastFormElementElementGroup() {
    return _.last(this.getFormElementGroups());
  }

  get numberOfPages() {
    return this.nonVoidedFormElementGroups().length;
  }

  get firstFormElementGroup() {
    return _.first(this.getFormElementGroups());
  }

  findFormElement(formElementName) {
    var formElement;
    _.forEach(this.nonVoidedFormElementGroups(), (formElementGroup) => {
      const foundFormElement = _.find(
        formElementGroup.getFormElements(),
        (formElement) => formElement.name === formElementName
      );
      if (!_.isNil(foundFormElement)) formElement = foundFormElement;
    });
    return formElement;
  }

  orderObservations(observations) {
    const orderedObservations = [];
    const conceptOrdering = _.sortBy(this.formElementGroups, (feg) => feg.displayOrder).map((feg) =>
      _.sortBy(feg.getFormElements(), (fe) => fe.displayOrder).map((fe) => fe.concept)
    );
    _.flatten(conceptOrdering).map((concept) => {
      const foundObs = observations.find((obs) => obs.concept.uuid === concept.uuid);
      if (!_.isNil(foundObs)) orderedObservations.push(foundObs);
    });
    const extraObs = observations.filter((obs) =>
      _.isNil(orderedObservations.find((oobs) => oobs.concept.uuid === obs.concept.uuid))
    );
    return orderedObservations.concat(extraObs);
  }

  static formTypes = {
    IndividualProfile: "IndividualProfile",
    Encounter: "Encounter",
    ProgramEncounter: "ProgramEncounter",
    ProgramEnrolment: "ProgramEnrolment",
    ProgramExit: "ProgramExit",
    ProgramEncounterCancellation: "ProgramEncounterCancellation",
    ChecklistItem: "ChecklistItem",
    IndividualEncounterCancellation: "IndividualEncounterCancellation",
  };
}

export default Form;
