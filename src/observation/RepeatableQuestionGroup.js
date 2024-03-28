import _ from 'lodash';
import QuestionGroup from "./QuestionGroup";

class RepeatableQuestionGroup {
    static TypeName = "RepeatableQuestionGroup";

    static actions = {
        add: 'add',
        remove: 'remove'
    };

    constructor(groupObservations) {
        this.repeatableObservations = _.isEmpty(groupObservations) ? [new QuestionGroup()] : groupObservations;
    }

    get toResource() {
        return _.map(this.repeatableObservations, obs => obs.toResource);
    }

    static fromObs({repeatableObservations}) {
        const newObs = _.map(repeatableObservations, obs => QuestionGroup.fromObs(obs));
        return new RepeatableQuestionGroup(newObs);
    }

    getValue() {
        return this.repeatableObservations;
    }

    getReadableValue() {
        return _.map(this.repeatableObservations, questionGroup => {
            return questionGroup.getReadableValue();
        })
    }

    isRepeatable() {
        return true;
    }

    cloneForEdit() {
        const newObs = _.map(this.repeatableObservations, (o) => o.cloneForEdit());
        return new RepeatableQuestionGroup(newObs);
    }

    isEmpty() {
        return _.isEmpty(this.repeatableObservations);
    }

    updateGroupObservationsAtIndex(groupObservations, index) {
        if (!groupObservations.isEmpty()) {
            this.repeatableObservations.splice(index, 1, groupObservations);
        } else {
            this.repeatableObservations.splice(index, 1);
        }
    }

    getGroupObservationAtIndex(index) {
        return this.repeatableObservations[index];
    }

    size() {
        return _.size(this.repeatableObservations);
    }

    nonEmptySize() {
        return _.size(_.filter(this.repeatableObservations, questionGroup => !questionGroup.isEmpty()));
    }

    addQuestionGroup() {
        this.repeatableObservations.push(new QuestionGroup());
    }

    removeQuestionGroup(index) {
        this.repeatableObservations.splice(index, 1);
    }

    getAllQuestionGroupObservations() {
        return this.repeatableObservations;
    }
}

export default RepeatableQuestionGroup
