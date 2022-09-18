import _ from "lodash";
import Concept from "../Concept";
import ConceptAnswer from "../ConceptAnswer";
import Observation from "../Observation";
import General from "../utility/General";
import ah from "../framework/ArrayHelper";

class QuestionGroup {
    constructor(groupObservations = []) {
        this.groupObservations = groupObservations;
    }

    get toResource() {
        const resource = {};
        _.forEach(this.groupObservations, obs => {
            const {conceptUUID, value} = obs.toResource;
            _.assign(resource, {[conceptUUID]: value})
        });
        return resource;
    }

    static fromObs({groupObservations}) {
        const newObs = _.map(groupObservations, ({concept, valueJSON}) => {
            const observation = new Observation();
            observation.concept = QuestionGroup.constructConceptModel(concept);
            const value = valueJSON.answer || valueJSON.value;
            const valueToPass = _.includes([Concept.dataType.Duration, Concept.dataType.PhoneNumber, Concept.dataType.Id], concept.datatype) ?
                valueJSON : value;
            observation.valueJSON = observation.concept.getValueWrapperFor(valueToPass);
            return observation;
        });
        return new QuestionGroup(newObs);
    }

    static constructConceptModel(resource) {
        const concept = Concept.fromResource(resource);
        concept.datatype = resource.datatype;
        if (!_.isNil(resource.answers)) {
            concept.answers = _.map(resource.answers, answer => {
                const conceptAnswer = General.assignFields(
                    answer,
                    new ConceptAnswer(),
                    ["uuid", "answerOrder", "abnormal", "unique", "voided"],
                );
                conceptAnswer.concept = QuestionGroup.constructConceptModel(answer.concept);
                return conceptAnswer;
            });
        }
        return concept;
    }

    getValue() {
        return this.groupObservations;
    }

    getReadableValue() {
        return _.map(this.groupObservations, obs => {
            return ({[obs.concept.name]: obs.getReadableValue()});
        })
    }

    isRepeatable() {
        return false;
    }

    findObservation(concept) {
        return _.find(this.groupObservations, (observation) => {
            return observation.concept.uuid === concept.uuid;
        });
    }

    findObservationByConceptUUID(conceptNameOrUUID) {
        return _.find(this.groupObservations, (obs) => obs.concept.uuid === conceptNameOrUUID ||
            obs.concept.name === conceptNameOrUUID)
    }

    getGroupObservationAtIndex(index) {
        return this;
    }

    getObservation(concept) {
        return this.findObservation(concept);
    }

    addObservation(observation) {
        this.groupObservations.push(observation);
    }

    removeExistingObs(concept) {
        return ah.remove(this.groupObservations, obs => obs.concept.uuid === concept.uuid);
    }

    getValueForConcept(concept) {
        const observation = this.findObservation(concept);
        return _.isNil(observation) ? observation : observation.getReadableValue();
    }

    cloneForEdit() {
        const newObs = _.map(this.groupObservations, (o) => o.cloneForEdit());
        return new QuestionGroup(newObs);
    }

    isEmpty() {
        return _.isEmpty(this.groupObservations);
    }

    size() {
        return 1;
    }
}


export default QuestionGroup
