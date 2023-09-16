import General from "../utility/General";
import ResourceUtil from "../utility/ResourceUtil";
import Form from "./Form";
import BaseEntity from "../BaseEntity";
import FormElement from "./FormElement";
import _ from "lodash";
import QuestionGroup from "../observation/QuestionGroup";
import RepeatableQuestionGroup from "../observation/RepeatableQuestionGroup";
import SchemaNames from "../SchemaNames";

class FormElementGroup extends BaseEntity {
  static schema = {
    name: SchemaNames.FormElementGroup,
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
      startTime: {type: 'int', optional: true},
      stayTime: {type: 'int', optional: true},
      timed: { type: "bool", default: false },
      textColour: { type: "string", optional: true },
      backgroundColour: { type: "string", optional: true },
    },
  };

   constructor(that = null) {
    super(that);
  }

  get name() {
      return this.that.name;
  }

  set name(x) {
      this.that.name = x;
  }

  get displayOrder() {
      return this.that.displayOrder;
  }

  set displayOrder(x) {
      this.that.displayOrder = x;
  }

  get display() {
      return this.that.display;
  }

  set display(x) {
      this.that.display = x;
  }

  get formElements() {
      return this.toEntityList("formElements", FormElement);
  }

  set formElements(x) {
      this.that.formElements = this.fromEntityList(x);
  }

  get form() {
      return this.toEntity("form", Form);
  }

  set form(x) {
      this.that.form = this.fromObject(x);
  }

  get rule() {
      return this.that.rule;
  }

  set rule(x) {
      this.that.rule = x;
  }

  get startTime() {
      return this.that.startTime;
  }

  set startTime(x) {
      this.that.startTime = x;
  }

  get stayTime() {
      return this.that.stayTime;
  }

  set stayTime(x) {
      this.that.stayTime = x;
  }

  get timed() {
      return this.that.timed;
  }

  set timed(x) {
      this.that.timed = x;
  }

  get textColour() {
      return this.that.textColour;
  }

  set textColour(x) {
      this.that.textColour = x;
  }

  get backgroundColour() {
      return this.that.backgroundColour;
  }

  set backgroundColour(x) {
      this.that.backgroundColour = x;
  }

  static fromResource(resource, entityService) {
    const formElementGroup = General.assignFields(resource, new FormElementGroup(), [
      "uuid",
      "name",
      "displayOrder",
      "display",
      "voided",
      "rule",
      "startTime",
      "stayTime",
      "timed",
      "textColour",
      "backgroundColour"
    ]);
    formElementGroup.form = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "formUUID"),
      Form.schema.name
    );
    return formElementGroup;
  }

  static merge = () => BaseEntity.mergeOn("formElements");

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
    formElement.formElementGroup = this;
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

  get styles() {
    const style = {};
    if (!_.isEmpty(this.backgroundColour)) {
      style['backgroundColor'] = this.backgroundColour
    }
    if (!_.isEmpty(this.textColour)) {
      style['color'] = this.textColour;
    }
    if (!_.isEmpty(style)) {
      style['paddingHorizontal'] = 5;
    }
    return style;
  }

  getFormElementsOfType(type) {
    return _.filter(
      this.formElements,
      (formElement) => ((formElement.concept.datatype === type || formElement.type === type) && !formElement.voided)
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
          _.forEach(repeatableQuestionGroup.getAllQuestionGroupObservations(), (questionGroup, index) => {
            this.validateQuestionGroup(questionGroup, childFormElements, validationResults, index);
          });
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
          return this.validateFormElement(formElement, questionGroup.findObservation(formElement.concept), validationResults, questionGroupIndex)
        })
  }

  validateFormElement(formElement, observation, validationResults, questionGroupIndex) {
    const validationResult = formElement.validate(
        _.isNil(observation) ? null : observation.getValue()
    );
    validationResult.addQuestionGroupIndex(questionGroupIndex);
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

  areAllFormElementsEmpty(filteredFormElements, observationHolder) {
    return  _.reduce(filteredFormElements, (areAllEmpty, formElement) => {
       return areAllEmpty && _.isNil(observationHolder.findObservation(formElement.concept))
      }, true
    );
  };

  getAllFormElementConcepts() {
    return this.formElements.map((x) => x.concept);
  }

  toJSON() {
    return {
      uuid: this.uuid,
      name: this.name,
      displayOrder: this.displayOrder,
      display: this.display,
      formElements: this.formElements,
      formUUID: this.form.uuid,
      startTime: this.startTime,
      stayTime: this.stayTime,
      timed: this.timed,
      textColour: this.textColour,
      backgroundColour: this.backgroundColour,
    };
  }
}

export default FormElementGroup;
