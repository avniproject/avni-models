import Individual from "../Individual";
import _ from "lodash";
import IndividualRelation from "./IndividualRelation";
import ValidationResult from "../application/ValidationResult";
import General from "../utility/General";

class IndividualRelative {
  constructor(individual, relative, relation, relationshipUUID) {
    this.individual = individual;
    this.relative = relative;
    this.relation = relation;
    this.relationshipUUID = relationshipUUID;
  }

  static createEmptyInstance() {
    const individualRelative = new IndividualRelative();
    individualRelative.individual = Individual.createEmptyInstance();
    individualRelative.relative = Individual.createEmptyInstance();
    individualRelative.relation = IndividualRelation.createEmptyInstance();
    return individualRelative;
  }

  cloneForEdit() {
    const individualRelative = new IndividualRelative();
    individualRelative.relation = this.relation.clone();
    individualRelative.enterDateTime = this.enterDateTime;
    individualRelative.exitDateTime = this.exitDateTime;
    individualRelative.individual = this.individual;
    individualRelative.relative = this.relative.cloneForReference();
    individualRelative.relationshipUUID = this.relationshipUUID;
    return individualRelative;
  }

  validateFieldForEmpty(value, key) {
    if (value instanceof Date) {
      return _.isNil(value)
        ? ValidationResult.failure(key, "emptyValidationMessage")
        : ValidationResult.successful(key);
    }
    return _.isEmpty(value)
      ? ValidationResult.failure(key, "emptyValidationMessage")
      : ValidationResult.successful(key);
  }

  static validationKeys = {
    RELATIVE: "RELATIVE",
    RELATION: "RELATION",
    INDIVIDUAL: "INDIVIDUAL",
  };

  validateRelative() {
    const emptyValidation = this.validateFieldForEmpty(
      this.relative.name,
      IndividualRelative.validationKeys.RELATIVE
    );
    if (!emptyValidation.success) return emptyValidation;

    if (this.relative.uuid === this.individual.uuid) {
      return ValidationResult.failure(
        IndividualRelative.validationKeys.RELATIVE,
        "selfRelationshipNotAllowed"
      );
    } else {
      return emptyValidation;
    }
  }

  isRelationPresent() {
    return !_.isEmpty(this.relation.uuid);
  }

  _validateRelationship() {
    if (
      _.toLower(this.relation.name) === "son" &&
      !General.dateAIsBeforeB(this.individual.dateOfBirth, this.relative.dateOfBirth)
    ) {
      return ValidationResult.failure(IndividualRelative.validationKeys.RELATIVE, "sonIsOlder");
    } else if (
        _.toLower(this.relation.name) === "daughter" &&
      !General.dateAIsBeforeB(this.individual.dateOfBirth, this.relative.dateOfBirth)
    ) {
      return ValidationResult.failure(
        IndividualRelative.validationKeys.RELATIVE,
        "daughterIsOlder"
      );
    } else if (
        _.toLower(this.relation.name) === "father" &&
      !General.dateAIsAfterB(this.individual.dateOfBirth, this.relative.dateOfBirth)
    ) {
      return ValidationResult.failure(
        IndividualRelative.validationKeys.RELATIVE,
        "fatherIsYounger"
      );
    } else if (
        _.toLower(this.relation.name) === "mother" &&
      !General.dateAIsAfterB(this.individual.dateOfBirth, this.relative.dateOfBirth)
    ) {
      return ValidationResult.failure(
        IndividualRelative.validationKeys.RELATIVE,
        "motherIsYounger"
      );
    }
    if (
        _.toLower(this.relation.name) === "grandson" &&
      !General.dateAIsBeforeB(this.individual.dateOfBirth, this.relative.dateOfBirth)
    ) {
      return ValidationResult.failure(
        IndividualRelative.validationKeys.RELATIVE,
        "grandsonIsOlder"
      );
    } else if (
        _.toLower(this.relation.name) === "granddaughter" &&
      !General.dateAIsBeforeB(this.individual.dateOfBirth, this.relative.dateOfBirth)
    ) {
      return ValidationResult.failure(
        IndividualRelative.validationKeys.RELATIVE,
        "granddaughterIsOlder"
      );
    } else if (
        _.toLower(this.relation.name) === "grandfather" &&
      !General.dateAIsAfterB(this.individual.dateOfBirth, this.relative.dateOfBirth)
    ) {
      return ValidationResult.failure(
        IndividualRelative.validationKeys.RELATIVE,
        "grandfatherIsYounger"
      );
    } else if (
        _.toLower(this.relation.name) === "grandmother" &&
      !General.dateAIsAfterB(this.individual.dateOfBirth, this.relative.dateOfBirth)
    ) {
      return ValidationResult.failure(
        IndividualRelative.validationKeys.RELATIVE,
        "grandmotherIsYounger"
      );
    }
  }

  validateIndividual() {
    return this.validateFieldForEmpty(
      this.individual.name,
      IndividualRelative.validationKeys.INDIVIDUAL
    );
  }

  validateRelation() {
    return this.validateFieldForEmpty(
      this.relation.name,
      IndividualRelative.validationKeys.RELATION
    );
  }

  validate(existingRelatives, skipRecordedRelationshipValidation) {
    const validationResults = [];
    validationResults.push(this.validateRelative());
    validationResults.push(this.validateIndividual());
    validationResults.push(this.validateRelation());
    if (!_.isNil(this.relative) && !_.isNil(this.relation)) {
      if (_.isNil(this.relative.name)) {
        validationResults.push(
          new ValidationResult(false, IndividualRelative.validationKeys.RELATIVE, "selectRelative")
        );
      } else if (
        !skipRecordedRelationshipValidation &&
        _.some(
          existingRelatives,
          (relative) =>
            relative.relative.uuid === this.relative.uuid &&
            relative.relation.uuid === this.relation.uuid
        )
      ) {
        validationResults.push(
          new ValidationResult(
            false,
            IndividualRelative.validationKeys.RELATIVE,
            "relationshipAlreadyRecorded"
          )
        );
        validationResults.push(
          new ValidationResult(
            false,
            IndividualRelative.validationKeys.RELATION,
            "relationshipAlreadyRecorded"
          )
        );
      } else {
        validationResults.push(this._validateRelationship());
      }
    }
    return _.reject(validationResults, _.isNil);
  }

  validateAge() {
    return this._validateRelationship();
  }

  validateSelectedRelation(validRelations, existingRelatives) {
    const selectedRelation = _.find(
      validRelations,
      (relation) => relation.name === this.relation.name
    );
    const validationResult = _.isEmpty(selectedRelation)
      ? ValidationResult.failure(
          IndividualRelative.validationKeys.RELATION,
          "relativeRelationGenderMismatch"
        )
      : ValidationResult.successful(IndividualRelative.validationKeys.RELATION);
    return [...this.validate(existingRelatives, true), validationResult];
  }

  relativeAndRelationSelected() {
    return !_.isEmpty(this.relation.name) && !_.isEmpty(this.relative.name) && !_.isEmpty(this.relative.gender);
  }
}

export default IndividualRelative;
