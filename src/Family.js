import moment from "moment";
import ResourceUtil from "./utility/ResourceUtil";
import AddressLevel from "./AddressLevel";
import Gender from "./Gender";
import General from "./utility/General";
import BaseEntity from "./BaseEntity";
import ProgramEnrolment from "./ProgramEnrolment";
import Encounter from "./Encounter";
import Individual from "./Individual";
import _ from "lodash";
import ObservationsHolder from "./ObservationsHolder";
import Observation from "./Observation";
import SchemaNames from './SchemaNames';

const mergeMap = new Map([
  [SchemaNames.ProgramEnrolment, "enrolments"],
  [SchemaNames.Encounter, "encounters"],
]);

class Family extends BaseEntity {
  static schema = {
    name: "Family",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      registrationDate: "date",
      lowestAddressLevel: "AddressLevel",
      headOfFamily: "Individual",
      typeOfFamily: "string",
      householdNumber: "string",
      members: { type: "list", objectType: "Individual" },
      observations: { type: "list", objectType: "Observation" },
    },
  };

   constructor(that = null) {
    super(that);
  }

  get registrationDate() {
      return this.that.registrationDate;
  }

  set registrationDate(x) {
      this.that.registrationDate = x;
  }

  get lowestAddressLevel() {
      return this.toEntity("lowestAddressLevel", AddressLevel);
  }

  set lowestAddressLevel(x) {
      this.that.lowestAddressLevel = this.fromObject(x);
  }

  get headOfFamily() {
      return this.toEntity("headOfFamily", Individual);
  }

  set headOfFamily(x) {
      this.that.headOfFamily = this.fromObject(x);
  }

  get typeOfFamily() {
      return this.that.typeOfFamily;
  }

  set typeOfFamily(x) {
      this.that.typeOfFamily = x;
  }

  get householdNumber() {
      return this.that.householdNumber;
  }

  set householdNumber(x) {
      this.that.householdNumber = x;
  }

  get members() {
      return this.toEntityList("members", Individual);
  }

  set members(x) {
      this.that.members = this.fromEntityList(x);
  }

  get observations() {
      return this.toEntityList("observations", Observation);
  }

  set observations(x) {
      this.that.observations = this.fromEntityList(x);
  }

  static validationKeys = {
    HEAD_OF_FAMILY: "HEAD_OF_FAMILY",
    TYPE_OF_FAMILY: "TYPE_OF_FAMILY",
    HOUSEHOLD_NUMBER: "HOUSEHOLD_NUMBER",
    REGISTRATION_DATE: "REGISTRATION_DATE",
    LOWEST_ADDRESS_LEVEL: "LOWEST_ADDRESS_LEVEL",
  };

  static createEmptyInstance() {
    const family = new Family();
    family.uuid = General.randomUUID();
    family.registrationDate = new Date();
    family.lowestAddressLevel = AddressLevel.create({
      uuid: "",
      title: "",
      level: 0,
      typeString: "",
      titleLineage: "",
    });
    family.headOfFamily = Individual.createEmptyInstance();
    family.members = [];
    family.observations = [];
    return family;
  }

  get toResource() {
    const resource = _.pick(this, ["uuid", "firstName", "lastName",
      "profilePicture", "dateOfBirthVerified"]);
    resource.dateOfBirth = moment(this.dateOfBirth).format("YYYY-MM-DD");
    resource.registrationDate = moment(this.registrationDate).format("YYYY-MM-DD");
    resource["genderUUID"] = this.gender.uuid;
    resource["addressLevelUUID"] = this.lowestAddressLevel.uuid;

    resource["observations"] = [];
    this.observations.forEach((obs) => {
      resource["observations"].push(obs.toResource);
    });

    return resource;
  }

  static fromResource(individualResource, entityService) {
    const addressLevel = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(individualResource, "addressUUID"),
      AddressLevel.schema.name
    );
    const gender = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(individualResource, "genderUUID"),
      Gender.schema.name
    );

    const individual = General.assignFields(
      individualResource,
      new Individual(),
      ["uuid", "firstName", "lastName", "profilePicture", "dateOfBirthVerified"],
      ["dateOfBirth", "registrationDate"],
      ["observations"],
      entityService
    );

    individual.gender = gender;
    individual.lowestAddressLevel = addressLevel;
    individual.name = `${individual.firstName} ${individual.lastName}`;

    return individual;
  }

  static merge = (childEntityClass) =>
    BaseEntity.mergeOn(
      mergeMap.get(childEntityClass)
    );

  static associateChild(child, childEntityClass, childResource, entityService) {
    let individual = BaseEntity.getParentEntity(
      entityService,
      childEntityClass,
      childResource,
      "individualUUID",
      Individual.schema.name
    );
    individual = General.pick(individual, ["uuid"], ["enrolments", "encounters"]);

    if (childEntityClass === ProgramEnrolment) BaseEntity.addNewChild(child, individual.enrolments);
    else if (childEntityClass === Encounter) BaseEntity.addNewChild(child, individual.encounters);
    else throw `${childEntityClass.name} not support by ${Individual.nameString}`;

    return individual;
  }

  setHeadOfFamily(individual) {
    this.headOfFamily = individual;
  }

  validateHeadOfFamily() {
    return this.validateFieldForEmpty(this.headOfFamily.name, Family.validationKeys.HEAD_OF_FAMILY);
  }

  validateRegistrationDate() {
    const validationResult = this.validateFieldForEmpty(
      this.registrationDate,
      Family.validationKeys.REGISTRATION_DATE
    );
    return validationResult;
  }

  validateAddress() {
    return this.validateFieldForEmpty(
      _.isEmpty(this.lowestAddressLevel) ? undefined : this.lowestAddressLevel.name,
      Family.validationKeys.LOWEST_ADDRESS_LEVEL
    );
  }

  validateTypeOfFamily() {
    return this.validateFieldForEmpty(this.typeOfFamily, Family.validationKeys.TYPE_OF_FAMILY);
  }

  validateHouseNumber() {
    return this.validateFieldForEmpty(this.householdNumber, Family.validationKeys.HOUSEHOLD_NUMBER);
  }

  validate() {
    const validationResults = [];
    validationResults.push(this.validateRegistrationDate());
    validationResults.push(this.validateAddress());
    validationResults.push(this.validateHeadOfFamily());
    validationResults.push(this.validateTypeOfFamily());
    validationResults.push(this.validateHouseNumber());

    return validationResults;
  }

  cloneForEdit() {
    const family = new Family();
    family.uuid = this.uuid;
    family.registrationDate = this.registrationDate;
    family.headOfFamily = this.headOfFamily.cloneForReference();
    family.typeOfFamily = this.typeOfFamily;
    family.householdNumber = this.householdNumber;
    family.members = this.members;
    family.lowestAddressLevel = _.isNil(this.lowestAddressLevel)
      ? null
      : this.lowestAddressLevel.cloneForReference();
    family.observations = ObservationsHolder.clone(this.observations);
    return family;
  }

  findObservation(conceptNameOrUuid) {
    return _.find(this.observations, (observation) => {
      return (observation.concept.name === conceptNameOrUuid) || (observation.concept.uuid === conceptNameOrUuid);
    });
  }

  getObservationValue(conceptNameOrUuid) {
    const observationForConcept = this.findObservation(conceptNameOrUuid);
    return _.isEmpty(observationForConcept)
      ? observationForConcept
      : observationForConcept.getValue();
  }
}

export default Family;
