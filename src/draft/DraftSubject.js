import ObservationsHolder from "../ObservationsHolder";
import Individual from "../Individual";


class DraftSubject {
    static schema = {
        name: "DraftSubject",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            subjectType: "SubjectType",
            firstName: "string",
            lastName: {type: "string", optional: true},
            dateOfBirth: {type: "date", optional: true},
            dateOfBirthVerified: {type: "bool", optional: true},
            gender: {type: "Gender", optional: true},
            registrationDate: "date",
            lowestAddressLevel: "AddressLevel",
            observations: {type: "list", objectType: "Observation"},
            registrationLocation: {type: "Point", optional: true},
            updatedOn: "date",
            totalMembers: {type: "string", optional: true}

        },
    };

    static create(subject, totalMembers) {
        const draftSubject = new DraftSubject();
        draftSubject.uuid = subject.uuid;
        draftSubject.subjectType = subject.subjectType;
        draftSubject.firstName = subject.firstName;
        draftSubject.lastName = subject.lastName;
        draftSubject.dateOfBirth = subject.dateOfBirth;
        draftSubject.registrationDate = subject.registrationDate;
        draftSubject.dateOfBirthVerified = subject.dateOfBirthVerified;
        draftSubject.gender = subject.gender;
        draftSubject.lowestAddressLevel = subject.lowestAddressLevel;
        draftSubject.observations = subject.observations;
        draftSubject.registrationLocation = subject.registrationLocation;
        draftSubject.totalMembers = _.isEmpty(totalMembers) ? null : totalMembers;
        draftSubject.updatedOn = new Date();
        return draftSubject;
    }

    constructIndividual() {
        const individual = new Individual();
        individual.uuid = this.uuid;
        individual.subjectType = this.subjectType.clone();
        individual.firstName = this.firstName;
        individual.lastName = this.lastName;
        individual.dateOfBirth = this.dateOfBirth;
        individual.registrationDate = this.registrationDate;
        individual.dateOfBirthVerified = this.dateOfBirthVerified;
        individual.gender = _.isNil(this.gender) ? null : this.gender.clone();
        individual.lowestAddressLevel = _.isNil(this.lowestAddressLevel)
            ? null
            : _.assignIn({}, this.lowestAddressLevel);
        individual.observations = ObservationsHolder.clone(this.observations);
        individual.registrationLocation = _.isNil(this.registrationLocation)
            ? null
            : this.registrationLocation.clone();
        individual.voided = false;
        individual.encounters = [];
        individual.enrolments = [];
        individual.relationships = [];
        individual.groupSubjects = [];
        return individual;
    }
}


export default DraftSubject;
