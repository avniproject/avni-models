import General from "../utility/General";
import BaseEntity from "../BaseEntity";
import FormElementGroup from "./FormElementGroup";
import _ from "lodash";
import FormMapping from "./FormMapping";
import EntitySyncStatus from "../EntitySyncStatus";
import moment from "moment";
import QuestionGroup from "../observation/QuestionGroup";
import RepeatableQuestionGroup from "../observation/RepeatableQuestionGroup";
import SchemaNames from "../SchemaNames";

class Form extends BaseEntity {
    static schema = {
        name: SchemaNames.Form,
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            formType: "string",
            name: "string",
            formElementGroups: {type: "list", objectType: "FormElementGroup"},
            decisionRule: {type: "string", optional: true},
            editFormRule: {type: "string", optional: true},
            visitScheduleRule: {type: "string", optional: true},
            validationRule: {type: "string", optional: true},
            checklistsRule: {type: "string", optional: true},
            taskScheduleRule: {type: "string", optional: true}
        },
    };

    constructor(that = null) {
        super(that);
    }

    get formType() {
        return this.that.formType;
    }

    set formType(x) {
        this.that.formType = x;
    }

    get name() {
        return this.that.name;
    }

    set name(x) {
        this.that.name = x;
    }

    get formElementGroups() {
        return this.toEntityList("formElementGroups", FormElementGroup);
    }

    set formElementGroups(x) {
        this.that.formElementGroups = this.fromEntityList(x);
    }

    get decisionRule() {
        return this.that.decisionRule;
    }

    set decisionRule(x) {
        this.that.decisionRule = x;
    }

    get editFormRule() {
        return this.that.editFormRule;
    }

    set editFormRule(x) {
        this.that.editFormRule = x;
    }

    get visitScheduleRule() {
        return this.that.visitScheduleRule;
    }

    set visitScheduleRule(x) {
        this.that.visitScheduleRule = x;
    }

    get validationRule() {
        return this.that.validationRule;
    }

    set validationRule(x) {
        this.that.validationRule = x;
    }

    get checklistsRule() {
        return this.that.checklistsRule;
    }

    set checklistsRule(x) {
        this.that.checklistsRule = x;
    }

    get taskScheduleRule() {
        return this.that.taskScheduleRule;
    }

    set taskScheduleRule(x) {
        this.that.taskScheduleRule = x;
    }

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
        const formSyncStatus = entityService.findByCriteria(`entityName = 'Form'`, EntitySyncStatus.schema.name);
        if (resource.formType === this.formTypes.IndividualProfile && formSyncStatus
            && moment(formSyncStatus.loadedSince).isBefore(moment(resource.lastModifiedDateTime))) {
            this.deleteOutOfSyncDrafts(entityService, resource.uuid);
        }
        return General.assignFields(resource, new Form(), [
            "uuid",
            "name",
            "formType",
            "decisionRule",
            "editFormRule",
            "visitScheduleRule",
            "taskScheduleRule",
            "validationRule",
            "checklistsRule",
            "taskScheduleRule"
        ]);
    }

    static deleteOutOfSyncDrafts(entityService, formUUID) {
        const formMappings = entityService.findAllByCriteria(`form.uuid = '${formUUID}'`, FormMapping.schema.name);
        _.forEach(formMappings, ({subjectType}) => {
            const outOfSyncDrafts = entityService.findAll("DraftSubject")
                .filtered(`subjectType.uuid = $0`, subjectType.uuid);
            entityService.deleteEntities(outOfSyncDrafts);
        })
    }

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
        return _.filter(this.formElementGroups, (formElementGroup) => {
            return !formElementGroup.voided;
        });
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

    getSelectedAnswer(concept, nullReplacement) {
        const observation = this.props.observationHolder.findObservation(concept);
        return _.isNil(observation) ? nullReplacement : observation.getValueWrapper();
    }


    orderObservations(observations) {
        const orderedObservations = [];
        const formElementOrdering = _.sortBy(this.formElementGroups, (feg) => feg.displayOrder).map((feg) =>
            _.sortBy(feg.getFormElements(), (fe) => fe.displayOrder));
        _.flatten(formElementOrdering).map((formElement) => {
            this.addSortedObservations(formElement, observations, orderedObservations);
        });
        const extraObs = observations.filter((obs) =>
            _.isNil(orderedObservations.find((oobs) => oobs.concept.uuid === obs.concept.uuid))
        );
        return orderedObservations.concat(extraObs);
    }

    //TODO add tests
    orderObservationsPerFEG(observations) {
        const orderedObservations = [];
        const formElementOrdering = _.sortBy(this.formElementGroups, (feg) => feg.displayOrder)
            .map(feg => {
                let fegOrderedObservations = [];
                const returnValue = {};
                returnValue.uuid = feg.uuid;
                returnValue.feg = feg;
                returnValue.sortedObservationsArray = fegOrderedObservations;
                this.orderObservationsWithinAFEG(feg.getFormElements(), observations, fegOrderedObservations);
                orderedObservations.concat(fegOrderedObservations);
                return returnValue;
            });
        return formElementOrdering;
    }

    orderObservationsWithinAFEG(formElements, observations, orderedObservations) {
        _.sortBy(formElements, (fe) => fe.displayOrder)
            .forEach(formElement => this.addSortedObservations(formElement, observations, orderedObservations));
        const extraObs = observations.filter((obs) =>
            _.isNil(orderedObservations.find((oobs) => oobs.concept.uuid === obs.concept.uuid))
        );
        orderedObservations.concat(extraObs);
        return extraObs;
    }

    sectionWiseOrderedObservations(observations) {
        const sections = [];
        const allObservations = [];
        const orderedFEG = _.sortBy(this.formElementGroups, ({displayOrder}) => displayOrder);
        _.forEach(orderedFEG, feg => {
            const formElementOrdering = _.sortBy(feg.getFormElements(), (fe) => fe.displayOrder);
            const fegObs = [];
            _.forEach(formElementOrdering, formElement => {
                this.addSortedObservations(formElement, observations, fegObs);
            });
            if (!_.isEmpty(fegObs)) {
                sections.push({
                    groupName: feg.name,
                    groupUUID: feg.uuid,
                    observations: fegObs,
                    groupStyles: feg.styles
                });
                allObservations.push(...fegObs);
            }
        });
        const decisionObs = observations.filter((obs) =>
            _.isNil(allObservations.find((oobs) => oobs.concept.uuid === obs.concept.uuid))
        );
        if (!_.isEmpty(decisionObs))
            sections.push({
                groupName: 'decisions',
                groupUUID: null,
                observations: decisionObs,
                groupStyles: {}
            });
        return sections;
    }

    orderQuestionGroupObservations(observations, groupUuid) {
        const childFormElements = [];
        const orderedChildObs = [];
        _.forEach(this.formElementGroups, feg => _.forEach(feg.getFormElements(), fe => {
                if (fe.groupUuid === groupUuid) {
                    childFormElements.push(fe)
                }
            })
        );
        const orderedFormElements = _.sortBy(childFormElements, fe => fe.displayOrder);
        _.forEach(orderedFormElements, (formElement) => this.addSortedObservations(formElement, observations, orderedChildObs, true));
        return orderedChildObs;
    }

    addSortedObservations(formElement, observations, orderedObservations, forQGChildren = false) {
        const concept = formElement.concept;
        const foundObs = observations.find((obs) => obs.concept.uuid === concept.uuid);
        if (!_.isNil(foundObs) && concept.isQuestionGroup()) {
            const clonedObs = foundObs.cloneForEdit();
            const valueWrapper = clonedObs.getValueWrapper();
            const isRepeatable = valueWrapper.isRepeatable();
            const sortedChildObs = isRepeatable ? _.flatMap(valueWrapper.getValue(), questionGroup => new QuestionGroup(this.orderQuestionGroupObservations(questionGroup.getValue(), formElement.uuid))) :
                this.orderQuestionGroupObservations(valueWrapper.getValue(), formElement.uuid);
            clonedObs.valueJSON = JSON.stringify(isRepeatable ? new RepeatableQuestionGroup(sortedChildObs) : new QuestionGroup(sortedChildObs));
            if (!_.isEmpty(sortedChildObs)) {
                clonedObs.styles = formElement.styles;
                orderedObservations.push(clonedObs);
            }
        } else {
            if (!_.isNil(foundObs) && (_.isNil(formElement.groupUuid) || forQGChildren)) {
                foundObs.styles = formElement.styles;
                orderedObservations.push(foundObs);
            }
        }
    }

    getFormElementGroupOrder(groupUUID) {
        const orderedFEG = _.sortBy(this.nonVoidedFormElementGroups(), ({displayOrder}) => displayOrder);
        return _.findIndex(orderedFEG, ({uuid}) => uuid === groupUUID) + 1;
    }

    getMandatoryConcepts() {
        const mandatoryConcepts = [];
        _.forEach(this.nonVoidedFormElementGroups(), feg => {
            _.forEach(feg.nonVoidedFormElements(), fe => {
                if (fe.mandatory) {
                    mandatoryConcepts.push(fe.concept);
                }
            })
        });
        return mandatoryConcepts;
    }

    getAllFormElementConcepts() {
        let concepts = [];
        this.formElementGroups.forEach((feg) => {
            concepts = _.concat(concepts, feg.getAllFormElementConcepts());
        });
        return concepts;
    }

    static formTypes = {
        ChecklistItem: "ChecklistItem",
        Encounter: "Encounter",
        IndividualEncounterCancellation: "IndividualEncounterCancellation",
        IndividualProfile: "IndividualProfile",
        ManualProgramEnrolmentEligibility: "ManualProgramEnrolmentEligibility",
        ProgramEncounter: "ProgramEncounter",
        ProgramEncounterCancellation: "ProgramEncounterCancellation",
        ProgramEnrolment: "ProgramEnrolment",
        ProgramExit: "ProgramExit",
        SubjectEnrolmentEligibility: "SubjectEnrolmentEligibility",
        Task: "Task",
    };
}

export default Form;
