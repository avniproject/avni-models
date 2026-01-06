import _, {isNil} from "lodash";
import Observation from "./Observation";
import PrimitiveValue from "./observation/PrimitiveValue";
import SingleCodedValue from "./observation/SingleCodedValue";
import MultipleCodedValues from "./observation/MultipleCodedValues";
import Concept from "./Concept";
import CompositeDuration from "./CompositeDuration";
import PhoneNumber from "./PhoneNumber";
import Identifier from "./Identifier";
import QuestionGroup from "./observation/QuestionGroup";
import General from "./utility/General";
import RepeatableQuestionGroup from "./observation/RepeatableQuestionGroup";
import ah from "./framework/ArrayHelper";

// Helper function to find media observation by value
const findMediaObservationByValue = (observations, targetValue) => {
    if (!observations || !Array.isArray(observations)) return null;

    return _.find(observations, obs => {
        // Check direct value
        if (obs.getValue && obs.getValue() === targetValue) return true;

        // Check coded values (for MultipleCodedValues)
        const valueJSON = obs.valueJSON;
        if (valueJSON && valueJSON.answer && Array.isArray(valueJSON.answer)) {
            return valueJSON.answer.includes(targetValue);
        }

        return false;
    });
};

// Helper function to update media value
const updateMediaValue = (mediaObs, oldVal, newVal) => {
    if (!mediaObs) return false;

    // For coded values, we need to update the array content
    if (mediaObs.valueJSON && mediaObs.valueJSON.answer && Array.isArray(mediaObs.valueJSON.answer)) {
        const answerIndex = mediaObs.valueJSON.answer.indexOf(oldVal);
        if (answerIndex >= 0) {
            mediaObs.valueJSON.answer[answerIndex] = newVal;
            return true;
        }
    } else {
        // Regular value update
        mediaObs.setValue(mediaObs.concept.getValueWrapperFor(newVal));
        return true;
    }

    return false;
};

// Process each question group observation
const processQuestionGroupObservations = (observations, oldVal, newVal) => {
    const mediaObs = findMediaObservationByValue(observations, oldVal);
    return mediaObs ? updateMediaValue(mediaObs, oldVal, newVal) : false;
};

class ObservationsHolder {
    constructor(observations) {
        this.observations = observations;
    }

    findObservation(concept) {
        return _.find(this.observations, (observation) => {
            return observation.concept.uuid === concept.uuid;
        });
    }

    findQuestionGroupObservation(concept, parentFormElement, questionGroupIndex) {
        const observations = this.findObservation(parentFormElement.concept);
        const groupObservations = observations && observations.getValueWrapper();
        if (parentFormElement.repeatable) {
            return groupObservations && groupObservations.size() > questionGroupIndex && groupObservations.getGroupObservationAtIndex(questionGroupIndex).getObservation(concept);
        }
        return groupObservations && groupObservations.getObservation(concept);
    }

    getObservation(concept) {
        return this.findObservation(concept);
    }

    findObservationByValue(value) {
        return _.find(this.observations, (observation) => observation.getValue() === value);
    }

    /*
    Called from the wizard on changes done by the user for primitive fields (including Date)
     */
    addOrUpdatePrimitiveObs(concept, value, answerSource = Observation.AnswerSource.Manual) {
        let currentObservation = this.findObservation(concept);
        const currentValue = currentObservation && currentObservation.getValueWrapper() || {};
        this._removeExistingObs(concept);
        if (!_.isEmpty(_.toString(value))) {
            if (concept.isIdConcept()) {
                this.observations.push(Observation.create(concept, Identifier.fromObs({
                    ...currentValue,
                    value
                })));
            } else {
                this.observations.push(
                    Observation.create(concept, new PrimitiveValue(value, concept.datatype, answerSource))
                );
            }
        }
    }

    //private
    _removeExistingObs(concept) {
        const observation = this.getObservation(concept);
        if (!_.isEmpty(observation)) {
            ah.remove(this.observations, (obs) => obs.concept.uuid === observation.concept.uuid);
        }
    }

    //private
    addOrUpdateCodedObs(concept, value, isSingleSelect, answerSource = Observation.AnswerSource.Auto) {
        this._removeExistingObs(concept);
        const getConceptUUID = (conceptAnswer) => conceptAnswer ? conceptAnswer.concept.uuid : undefined;
        if (!_.isEmpty(value)) {
            const answerUUID = isSingleSelect
                ? getConceptUUID(concept.getAnswerWithConceptName(value))
                : value.map(v => getConceptUUID(concept.getAnswerWithConceptName(v)));
            const observation = Observation.create(concept, isSingleSelect ? new SingleCodedValue(answerUUID, answerSource) : new MultipleCodedValues(answerUUID, answerSource));
            this.observations.push(observation);
        }
    }

    /*
    called during edit of form element by the user and when the page transition takes place
     */
    removeNonApplicableObs(allFormElements, applicableFormElements) {
        const formElementsIncludingRepeatableElements = [];
        _.forEach(allFormElements, fe => {
            if (fe.concept.isQuestionGroup()) {
                const observations = this.findObservation(fe.concept);
                const questionGroupObs = observations && observations.getValueWrapper();
                const size = questionGroupObs ? questionGroupObs.size() : 1;
                const childFormElements = _.filter(allFormElements, ({groupUuid}) => groupUuid === fe.uuid);
                _.forEach(childFormElements, cfe => {
                    _.range(size).forEach(questionGroupIndex => {
                        const newFormElement = cfe.clone();
                        newFormElement.questionGroupIndex = questionGroupIndex;
                        formElementsIncludingRepeatableElements.push(newFormElement);
                    })
                })
                formElementsIncludingRepeatableElements.push(fe);
            } else if (_.isNil(fe.groupUuid)) {
                formElementsIncludingRepeatableElements.push(fe);
            }
        });
        const inApplicableFormElements = _.differenceWith(
            formElementsIncludingRepeatableElements,
            applicableFormElements,
            (a, b) => a.uuid === b.uuid && a.questionGroupIndex === b.questionGroupIndex
        );
        applicableFormElements.forEach((fe) => {
            if (fe.concept.isCodedConcept() && (!_.isEmpty(fe.answersToShow) || !_.isEmpty(fe.answersToExclude))) {
                fe.isQuestionGroup() ?
                    this.removeNonApplicableAnswersFromQuestionGroup(fe, fe.isSingleSelect(), allFormElements) :
                    this.removeNonApplicableAnswers(fe, fe.isSingleSelect(), this.getObservation(fe.concept));
            }
        });
        return _.flatten(inApplicableFormElements.map(fe => this._removeObs(fe))).filter(obs => !_.isEmpty(obs));
    }

    //private
    removeNonApplicableAnswersFromQuestionGroup(fe, isSingleSelect) {
        const questionGroup = this.getQuestionGroups(fe);
        const questionGroupObservation = questionGroup && questionGroup.getGroupObservationAtIndex(fe.questionGroupIndex);
        const observation = questionGroupObservation && questionGroupObservation.getObservation(fe.concept);
        if (!_.isEmpty(observation)) {
            questionGroupObservation.removeExistingObs(fe.concept);
            const applicableConceptAnswerUUIDs = fe.getApplicableAnswerConceptUUIDs();
            const applicableAnswers = _.filter(_.flatten([observation.getValue()]), value => _.includes(applicableConceptAnswerUUIDs, value));
            const newValue = isSingleSelect ? new SingleCodedValue(_.head(applicableAnswers)) : new MultipleCodedValues(applicableAnswers);
            const newObservation = Observation.create(observation.concept, newValue);
            questionGroupObservation.addObservation(newObservation);
        }
    }

    //private
    _removeObs(formElement) {
        if (formElement.isQuestionGroup()) {
            const questionGroup = this.getQuestionGroups(formElement);
            const questionGroupObservation = questionGroup && questionGroup.getGroupObservationAtIndex(formElement.questionGroupIndex);
            return questionGroupObservation && questionGroupObservation.removeExistingObs(formElement.concept);
        } else {
            return ah.remove(this.observations, (obs) => obs.concept.uuid === formElement.concept.uuid)
        }
    }

    getQuestionGroups(formElement) {
        const parentFormElement = formElement.getParentFormElement();
        const questionGroupObservations = this.getObservation(parentFormElement.concept);
        return questionGroupObservations && questionGroupObservations.getValueWrapper();
    }

    //private
    removeNonApplicableAnswers(fe, isSingleSelect, observation) {
        if (!_.isEmpty(observation)) {
            ah.remove(this.observations, (obs) => obs.concept.uuid === observation.concept.uuid);
            const applicableConceptAnswerUUIDs = fe.getApplicableAnswerConceptUUIDs();
            const applicableAnswers = _.filter(_.flatten([observation.getValue()]), value => _.includes(applicableConceptAnswerUUIDs, value));
            const newValue = isSingleSelect ? new SingleCodedValue(_.head(applicableAnswers)) : new MultipleCodedValues(applicableAnswers);
            const newObservation = Observation.create(observation.concept, newValue);
            this.observations.push(newObservation);
        }
    }

    /*
    Called from wizard after the update of the fields is called for all types. This is to sync up the coded fields based on the rules.
     */
    updatePrimitiveCodedObs(applicableFormElements, formElementStatuses) {
        const updateQuestionGroupObs = (parentFormElement, questionGroupIndex, fe, value) => {
            parentFormElement && parentFormElement.repeatable ? this.updateRepeatableGroupQuestion(questionGroupIndex, parentFormElement, fe, value) :
                this.updateGroupQuestion(parentFormElement, fe, value);
        };

        applicableFormElements.forEach((fe) => {
            const formElementStatus = _.find(formElementStatuses, (formElementStatus) => {
                return (fe.uuid === formElementStatus.uuid) && (_.isNil(fe.questionGroupIndex) || fe.questionGroupIndex === formElementStatus.questionGroupIndex);
            });
            const {
                value,
                questionGroupIndex,
                initializedWithNullValueOnPurpose
            } = formElementStatus;
            if (!_.isNil(value) || (!!initializedWithNullValueOnPurpose)) {
                const concept = fe.concept;
                if (fe.isQuestionGroup()) {
                    const parentFormElement = _.find(applicableFormElements, ({uuid}) => fe.groupUuid === uuid);
                    updateQuestionGroupObs(parentFormElement, questionGroupIndex, fe, value);
                } else if (concept.isQuestionGroup() && !_.isNil(value) && _.isArray(value)) {
                    const observation = this.findObservation(concept);
                    const questionGroup = observation && observation.getValueWrapper();
                    const size = questionGroup ? questionGroup.size() : 0;
                    if (size >= value.length) {
                        // Don't populate the values if already done. This will allow users to edit the prepopulated values.
                        // This check is added to make sure user can update the group values.
                        return;
                    }
                    _.forEach(value, (questionGroupValue, index) => {
                        if (fe.repeatable && (size < (index + 1))) {
                            this.updateRepeatableGroupQuestion(index, fe, null, null, 'add');
                        }
                        _.forEach(questionGroupValue, (answerValue, conceptUUID) => {
                            const childFormElement = _.find(fe.formElementGroup.getFormElements(), ({concept}) => concept.uuid === conceptUUID);
                            if (childFormElement.concept.isCodedConcept() && childFormElement.isMultiSelect() && _.isArray(answerValue)) {
                                _.forEach(answerValue, v => updateQuestionGroupObs(fe, index, childFormElement, v))
                            } else {
                                updateQuestionGroupObs(fe, index, childFormElement, answerValue)
                            }
                        })
                    })
                } else {
                    concept.isCodedConcept()
                        ? this.addOrUpdateCodedObs(concept, value, fe.isSingleSelect())
                        : this.addOrUpdatePrimitiveObs(concept, value, Observation.AnswerSource.Auto);
                }
            }
        });
    }

    /*
    called for direct edit of single select field
     */
    toggleSingleSelectAnswer(concept, answerUUID) {
        return this.toggleCodedAnswer(concept, answerUUID, true);
    }

    //private
    toggleCodedAnswer(concept, answerUUID, isSingleSelect) {
        let observation = this.getObservation(concept);
        if (_.isEmpty(observation)) {
            observation = Observation.create(
                concept,
                isSingleSelect
                    ? new SingleCodedValue(answerUUID)
                    : new MultipleCodedValues().push(answerUUID)
            );
            this.observations.push(observation);
            return observation;
        } else {
            isSingleSelect
                ? observation.toggleSingleSelectAnswer(answerUUID)
                : observation.toggleMultiSelectAnswer(answerUUID);
            if (observation.hasNoAnswer()) {
                ah.remove(this.observations, (obs) => obs.concept.uuid === observation.concept.uuid);
                return null;
            }
            observation.valueJSON.answerSource = Observation.AnswerSource.Manual;
            return observation;
        }
    }

    /*
    called for direct edit of duration field
     */
    updateCompositeDurationValue(concept, duration) {
        let observation = this.getObservation(concept);
        if (!_.isEmpty(observation)) {
            ah.remove(this.observations, (obs) => obs.concept.uuid === observation.concept.uuid);
        }
        observation = Observation.create(concept, duration);
        this.observations.push(observation);
        return observation;
    }

    /*
    called for direct edit of phone number field
     */
    updatePhoneNumberValue(concept, phoneNumber, verified = false, skipVerification = false) {
        let observation = this.getObservation(concept);
        if (!_.isEmpty(observation)) {
            ah.remove(this.observations, (obs) => obs.concept.uuid === observation.concept.uuid);
            if (_.isEmpty(phoneNumber)) return null;
        }
        observation = Observation.create(concept, new PhoneNumber(phoneNumber, verified, skipVerification));
        this.observations.push(observation);
        return observation;
    }

    updateGroupQuestion(parentFormElement, childFormElement, value, verified = false, skipVerification = false) {
        if (_.isUndefined(parentFormElement) || _.isNull(parentFormElement)) {
            return;
        }
        const parentConcept = parentFormElement.concept;
        const parentObservation = this.getObservation(parentConcept);
        const childObservations = _.isEmpty(parentObservation) ? new QuestionGroup() : parentObservation.getValueWrapper();
        this.updateChildObservations(childFormElement, childObservations, value, verified, skipVerification);
        this._removeExistingObs(parentConcept);
        if (!childObservations.isEmpty()) {
            this.observations.push(Observation.create(parentConcept, childObservations));
        }
    }

    //private
    updateChildObservations(childFormElement, childObservations, value, verified = false, skipVerification = false) {
        const childConcept = childFormElement.concept;
        if (childConcept.isPrimitive()) {
            childObservations.removeExistingObs(childConcept);
            if (!_.isEmpty(_.toString(value))) {
                const observation = Observation.create(childConcept, new PrimitiveValue(value, childConcept.datatype));
                childObservations.addObservation(observation);
            }
        }
        if (childConcept.isCodedConcept() || childConcept.isMediaConcept() || childConcept.isSubjectConcept()) {
            let observation = childObservations.getObservation(childConcept);
            const isSingleSelect = childFormElement.isSingleSelect();
            if (_.isEmpty(observation)) {
                observation = Observation.create(childConcept,
                    isSingleSelect ? new SingleCodedValue(value) : new MultipleCodedValues().push(value));
                childObservations.addObservation(observation);
            } else {
                if (!_.isNil(value)) {
                    isSingleSelect ? observation.toggleSingleSelectAnswer(value) : observation.toggleMultiSelectAnswer(value);
                }
                if (observation.hasNoAnswer() || _.isNil(value)) {
                    childObservations.removeExistingObs(childConcept);
                }
            }
        }
        if (childFormElement.getType() === Concept.dataType.Duration && !isNil(childFormElement.durationOptions)) {
            childObservations.removeExistingObs(childConcept);
            if (!_.isEmpty(value) && !_.isEmpty(value.durations)) {
                const observation = Observation.create(childFormElement.concept, CompositeDuration.fromObs(value));
                childObservations.addObservation(observation);
            }
        }
        if (childFormElement.getType() === Concept.dataType.PhoneNumber) {
            childObservations.removeExistingObs(childConcept);
            if (!_.isEmpty(value)) {
                const observation = Observation.create(childFormElement.concept, new PhoneNumber(value, verified, skipVerification));
                childObservations.addObservation(observation);
            }
        }
    }

    updateRepeatableGroupQuestion(index, parentFormElement, childFormElement, value, action, verified = false, skipVerification = false) {
        const parentConcept = parentFormElement.concept;
        const observations = this.getObservation(parentConcept);
        const repeatableObservations = _.isEmpty(observations) ? new RepeatableQuestionGroup() : observations.getValueWrapper();
        if (action === RepeatableQuestionGroup.actions.add) {
            repeatableObservations.addQuestionGroup();
            return
        } else if (action === RepeatableQuestionGroup.actions.remove) {
            repeatableObservations.removeQuestionGroup(index);
            return
        }
        const childObservations = repeatableObservations.getGroupObservationAtIndex(index);
        this.updateChildObservations(childFormElement, childObservations, value, verified, skipVerification);
        repeatableObservations.updateGroupObservationsAtIndex(childObservations, index);
        this._removeExistingObs(parentConcept);
        if (!repeatableObservations.isEmpty()) {
            this.observations.push(Observation.create(parentConcept, repeatableObservations));
        }
    }

    toggleMultiSelectAnswer(concept, answerUUID) {
        return this.toggleCodedAnswer(concept, answerUUID, false);
    }

    static clone(observations) {
        return _.map(observations, (o) => o.cloneForEdit());
    }

    static convertObsForSave(observations) {
        observations.forEach(observation => {
            if (observation.valueJSON && typeof (observation.valueJSON) !== "string") {
                observation.valueJSON = JSON.stringify(observation.valueJSON);
            }
        });
    }

    //private
    getObservationReadableValue(concept) {
        let obs = this.getObservation(concept);
        return obs ? obs.getReadableValue() : null;
    }

    addOrUpdateObservation(concept, value) {
        let observation = this.getObservation(concept);
        let valueWrapper = concept.getValueWrapperFor(value);

        if (observation) {
            observation.setValue(valueWrapper);
        } else {
            this.observations.push(Observation.create(concept, valueWrapper));
        }
    }

    //private
    updateObservationBasedOnValue(oldValue, newValue) {
        // Try to find at top level first
        const observation = this.findObservationByValue(oldValue);
        if (observation) {
            observation.setValue(observation.concept.getValueWrapperFor(newValue));
            return true;
        }

        // Search in nested structures if not found at top level
        let updated = false;

        // Iterate through all observations
        _.forEach(this.observations, obs => {
            // Skip non-question group observations
            if (obs.concept.datatype !== Concept.dataType.QuestionGroup) return;

            const valueWrapper = obs.getValueWrapper && obs.getValueWrapper();
            if (!valueWrapper) return;

            // Handle RepeatableQuestionGroup
            if (valueWrapper.isRepeatable && valueWrapper.isRepeatable()) {
                const allGroups = valueWrapper.getAllQuestionGroupObservations &&
                                valueWrapper.getAllQuestionGroupObservations();

                if (allGroups && allGroups.length) {
                    // Check each group in the repeatable question group
                    allGroups.forEach(group => {
                        const groupObservations = group.getValue && group.getValue();
                        if (processQuestionGroupObservations(groupObservations, oldValue, newValue)) {
                            updated = true;
                        }
                    });
                }
            }
            // Handle regular QuestionGroup
            else {
                const groupObservations = valueWrapper.getValue && valueWrapper.getValue();
                if (processQuestionGroupObservations(groupObservations, oldValue, newValue)) {
                    updated = true;
                }
            }
        });

        return updated;
    }

    // Helper method to update media value in an observation
_updateMediaValueInObservation(observation, oldValue, newValue) {
    if (!observation) return false;

    const valueWrapper = observation.getValueWrapper && observation.getValueWrapper();
    if (!valueWrapper) return false;

    // Handle ImageV2 type
    if (observation.concept.datatype === Concept.dataType.ImageV2) {
        const mediaObjects = JSON.parse(valueWrapper.getValue());
        let updated = false;

        const newAnswers = _.map(mediaObjects, mediaObject => {
            if (mediaObject.uri === oldValue) {
                mediaObject.uri = newValue;
                updated = true;
            }
            return mediaObject;
        });

        if (updated) {
            observation.valueJSON = new PrimitiveValue(JSON.stringify(newAnswers), Concept.dataType.ImageV2);
            return true;
        }
    }
    // Handle multiple coded values
    else if (valueWrapper.isMultipleCoded) {
        const answers = valueWrapper.getValue();
        const oldValueIndex = _.indexOf(answers, oldValue);

        if (oldValueIndex >= 0) {
            const newAnswers = _.reject(answers, answer => answer === oldValue);
            newAnswers.splice(oldValueIndex, 0, newValue);
            observation.valueJSON = new MultipleCodedValues(newAnswers);
            return true;
        }
    }
    // Handle single coded value
    else if (valueWrapper.getValue() === oldValue) {
        observation.valueJSON = new SingleCodedValue(newValue);
        return true;
    }

    return false;
}

// Helper to find and update media in question group
_updateMediaInQuestionGroup(questionGroup, conceptUUID, oldValue, newValue) {
    if (!questionGroup || !questionGroup.getValue) return false;

    const groupObservations = questionGroup.getValue();
    if (!groupObservations || !Array.isArray(groupObservations)) return false;

    // Find media observation either by concept UUID or by value
    const mediaObs = _.find(groupObservations, obs =>
        obs.concept.uuid === conceptUUID ||
        (Concept.dataType.Media.includes(obs.concept.datatype) &&
         obs.getValue && obs.getValue() === oldValue));

    // Update if found
    return this._updateMediaValueInObservation(mediaObs, oldValue, newValue);
}

// Helper to find and update media in repeatable question group
_updateMediaInRepeatableQuestionGroup(repeatableGroup, conceptUUID, oldValue, newValue) {
    if (!repeatableGroup || !repeatableGroup.getAllQuestionGroupObservations) return false;

    const allGroups = repeatableGroup.getAllQuestionGroupObservations();
    if (!allGroups || !allGroups.length) return false;

    // Check each group in the repeatable question group
    let updated = false;

    allGroups.forEach(group => {
        if (this._updateMediaInQuestionGroup(group, conceptUUID, oldValue, newValue)) {
            updated = true;
        }
    });

    return updated;
}

// Helper to process a question group (regular or repeatable) and update media within it
_processQuestionGroupWrapper(wrapper, conceptUUID, oldValue, newValue, sourceName) {
    if (!wrapper) return false;

    // Determine if it's a repeatable question group or regular question group
    const isRepeatable = wrapper.isRepeatable && wrapper.isRepeatable();

    // Process the appropriate group type
    return isRepeatable
        ? this._updateMediaInRepeatableQuestionGroup(wrapper, conceptUUID, oldValue, newValue)
        : this._updateMediaInQuestionGroup(wrapper, conceptUUID, oldValue, newValue);
}

replaceMediaObservation(oldValue, newValue, conceptUUID) {
    console.log(`[INFO] Replacing media: ${oldValue} → ${newValue}`);

    // Since conceptUUID is always provided in practice, optimize for that case first
    // Try to find direct top-level observation with matching concept UUID
    const directObservation = _.find(this.observations, obs => obs.concept.uuid === conceptUUID);
    if (directObservation) {
        // Direct media observation
        if (Concept.dataType.Media.includes(directObservation.concept.datatype)) {
            if (this._updateMediaValueInObservation(directObservation, oldValue, newValue)) {
                console.log(`[INFO] Updated media in direct observation`);
                return true;
            }
        }
        // Question Group containing the media
        else if (directObservation.concept.datatype === Concept.dataType.QuestionGroup) {
            const valueWrapper = directObservation.getValueWrapper();
            if (this._processQuestionGroupWrapper(valueWrapper, conceptUUID, oldValue, newValue)) {
                console.log(`[INFO] Updated media in question group`);
                return true;
            }
        }
    }

    // Check nested structures (this works both with and without conceptUUID)
    let updated = false;

    _.forEach(this.observations, obs => {
        // Only process question groups
        if (obs.concept.datatype !== Concept.dataType.QuestionGroup) return;

        const valueWrapper = obs.getValueWrapper && obs.getValueWrapper();
        if (!valueWrapper) return;

        if (this._processQuestionGroupWrapper(valueWrapper, conceptUUID, oldValue, newValue)) {
            updated = true;
        }
    });

    if (updated) {
        console.log(`[INFO] Updated media in nested structure`);
        return true;
    }

    // As a fallback, use value-based replacement if we couldn't find it by concept
    // This ensures backward compatibility and handles edge cases
    return this.updateObservationBasedOnValue(oldValue, newValue);
}

    toString(I18n) {
        let display = "";
        this.observations.forEach((obs) => {
            display += `${I18n.t(obs.concept.name)}: ${obs.getReadableValue()}\n`;
        });
        return display;
    }

    // it uses only underlying realm model and not avni model
    static hasAnyAnswer(obsHolder, conceptUuid, answerUuids) {
        return _.some(obsHolder.observations, (obs) => obs.concept.uuid === conceptUuid && obs.valueJSON
            && _.some(answerUuids, (ansUuid) => obs.valueJSON.includes(ansUuid)));
    }
}

export default ObservationsHolder;
