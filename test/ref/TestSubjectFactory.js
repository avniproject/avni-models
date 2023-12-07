import moment from "moment";
import General from "../../src/utility/General";
import Individual from "../../src/Individual";

class TestSubjectFactory {
    static createWithDefaults({
                                  uuid = General.randomUUID(),
                                  subjectType,
                                  firstName,
                                  lastName,
                                  address,
                                  registrationDate = moment().toDate(),
                                  observations = [],
                                  approvalStatuses = []
                              }) {
        const subject = new Individual();
        subject.uuid = uuid;
        subject.subjectType = subjectType;
        subject.firstName = firstName;
        subject.lastName = lastName;
        subject.name = firstName;
        subject.lowestAddressLevel = address;
        subject.registrationDate = registrationDate;
        subject.observations = observations;
        subject.approvalStatuses = approvalStatuses;
        subject.setLatestEntityApprovalStatus(subject.latestEntityApprovalStatus);
        return subject;
    }
}

export default TestSubjectFactory;
