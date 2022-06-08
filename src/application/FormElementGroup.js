import General from "../utility/General";
import ResourceUtil from "../utility/ResourceUtil";
import Form from "./Form";
import BaseEntity from "../BaseEntity";
import FormElement from "./FormElement";
import _ from "lodash";
import QuestionGroup from "../observation/QuestionGroup";
import RepeatableQuestionGroup from "../observation/RepeatableQuestionGroup";
import ValidationResult from "./ValidationResult";

class FormElementGroup {
  static schema = {
    name: "FormElementGroup",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      name: "string",
      displayOrder: "double",
      display: { type: "string", optional: true },
      formElements: { type: "list", objectType: "FormElement" },
      form: "Form",
      voided: { type: "bool", default: false },
      rule: { type: "string", optional: true },
    },
  };

  static fromResource(resource, entityService) {
    const formElementGroup = General.assignFields(resource, new FormElementGroup(), [
      "uuid",
      "name",
      "displayOrder",
      "display",
      "voided",
      "rule",
    ]);
    formElementGroup.form = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "formUUID"),
      Form.schema.name
    );
    return formElementGroup;
  }

  static merge = () => BaseEntity.mergeOn("formElements");

  static parentAssociations = () => new Map([[Form, "formUUID"]]);

  static childAssociations = () => new Map([[FormElement, "formElements"]]);

  static associateChild(child, childEntityClass, childResource, entityService) {
    let formElementGroup = BaseEntity.getParentEntity(
      entityService,
      childEntityClass,
      childResource,
      "formElementGroupUUID",
      FormElementGroup.schema.name
    );
    formElementGroup = General.pick(formElementGroup, ["uuid"], ["formElements"]);
    if (childEntityClass === FormElement) {
      BaseEntity.addNewChild(child, formElementGroup.formElements);
    } else throw `${childEntityClass.name} not support by ${FormElementGroup.name}`;
    return formElementGroup;
  }

  addFormElement(formElement) {
    this.formElements.push(formElement);
  }

  next() {
    return this.form.getNextFormElement(this.displayOrder);
  }

  previous() {
    return this.form.getPrevFormElement(this.displayOrder);
  }

  get isLast() {
    return this.form.getLastFormElementElementGroup().displayOrder > this.displayOrder;
  }

  get isFirst() {
    return this.displayOrder === 1;
  }

  getFormElementsOfType(type) {
    return _.filter(
      this.formElements,
      (formElement) => formElement.concept.datatype === type || formElement.type === type
    );
  }

  validate(observationHolder, filteredFormElements) {
    const validationResults = [];
    filteredFormElements.forEach((formElement) => {
      if (formElement.concept.isQuestionGroup()) {
        const childFormElements = _.filter(filteredFormElements, fe => fe.groupUuid === formElement.uuid);
        const observations = observationHolder.findObservation(formElement.concept);
        if (formElement.repeatable) {
          const repeatableQuestionGroup = _.isEmpty(observations) ? new RepeatableQuestionGroup() : observations.getValueWrapper();
          const groupValidationResults = [];
          _.forEach(repeatableQuestionGroup.getAllQuestionGroupObservations(), (questionGroup, index) => {
            const childValidations = [];
            this.validateQuestionGroup(questionGroup, childFormElements, childValidations, index);
            groupValidationResults.push(childValidations);
          });
          const isSuccess = _.every(groupValidationResults, childValidations => _.every(childValidations, ({success}) => success));
          const validationResult = new ValidationResult(isSuccess, formElement.uuid);
          validationResult.groupValidations = groupValidationResults;
          validationResults.push(validationResult);
        } else {
          const questionGroup = _.isEmpty(observations) ? new QuestionGroup() : observations.getValueWrapper();
          this.validateQuestionGroup(questionGroup, childFormElements, validationResults, 0);
        }
      } else if (!formElement.isQuestionGroup()) {
        this.validateFormElement(formElement, observationHolder.findObservation(formElement.concept), validationResults);
      }
    });
    return validationResults;
  }

  validateQuestionGroup(questionGroup, childFormElements, validationResults, questionGroupIndex) {
    _.filter(childFormElements, fe => _.isNil(fe.questionGroupIndex) || fe.questionGroupIndex === questionGroupIndex)
        .forEach(formElement => {
          return this.validateFormElement(formElement, questionGroup.findObservation(formElement.concept), validationResults);
        })
  }

  validateFormElement(formElement, observation, validationResults) {
    const validationResult = formElement.validate(
        _.isNil(observation) ? null : observation.getValue()
    );
    validationResults.push(validationResult);
  }

  get formElementIds() {
    return this.getFormElements().map((formElement) => {
      return formElement.uuid;
    });
  }

  nonVoidedFormElements() {
    return _.filter(this.formElements, (formElement) => !formElement.voided);
  }

  getFormElements() {
    return FormElementGroup._sortedFormElements(this.nonVoidedFormElements());
  }

  static _sortedFormElements(list) {
    return _.sortBy(list, (formElement) => formElement.displayOrder);
  }

  get translatedFieldValue() {
    return this.display;
  }

  removeFormElement(formElementName) {
    this.formElements = _.reject(this.getFormElements(), (formElement) =>
      formElement.matches(formElementName)
    );
    return this;
  }

  filterElements(formElementStatuses) {
    const filteredFormElements = [];
    const allFormElements = this.getFormElements();
    _.forEach(formElementStatuses, ({questionGroupIndex, uuid, visibility, answersToShow, answersToSkip}) => {
      const formElement = _.find(allFormElements, fe => fe.uuid === uuid);
      if (visibility && formElement) {
        //clone is required to assign different questionGroupIndex to the same form element
        const newFormElement = formElement.clone();
        newFormElement.setAnswersToShow = answersToShow;
        newFormElement.answersToSkip = answersToSkip;
        newFormElement.questionGroupIndex = questionGroupIndex;
        filteredFormElements.push(newFormElement);
      }
    });
    return FormElementGroup._sortedFormElements(filteredFormElements);
  }

  toJSON() {
    return {
      uuid: this.uuid,
      name: this.name,
      displayOrder: this.displayOrder,
      display: this.display,
      formElements: this.formElements,
      formUUID: this.form.uuid,
    };
  }
}

export default FormElementGroup;
