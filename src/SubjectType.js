import ReferenceEntity from "./ReferenceEntity";
import General from "./utility/General";

class SubjectType extends ReferenceEntity {
    static schema = {
        name: 'SubjectType',
        primaryKey: 'uuid',
        properties: {
            uuid: 'string',
            name: 'string',
            group: {type: 'bool', default: false},
            voided: {type: 'bool', default: false}
        }
    };
    uuid;

    static create(name, group = false) {
        let subjectType = new SubjectType();
        subjectType.uuid = General.randomUUID();
        subjectType.name = name;
        subjectType.group = group;
        return subjectType;
    }

    static fromResource(operationalSubjectType) {
        const subjectType = new SubjectType();
        //assuming here that the base name is not needed. When needed we will introduce it.
        subjectType.name = operationalSubjectType.name;
        subjectType.uuid = operationalSubjectType.subjectTypeUUID;
        subjectType.voided = !!operationalSubjectType.voided;
        subjectType.group = operationalSubjectType.group;
        return subjectType;
    }

    clone() {
        const cloned = new SubjectType();
        cloned.uuid = this.uuid;
        cloned.name = this.name;
        cloned.voided = this.voided;
        cloned.group = this.group;
        return cloned;
    }

    isIndividual() {
        return this.name === 'Individual' || this.name === 'Patient';
    }

    registerIcon() {
        return this.isIndividual() ? 'account-plus' : 'plus-box';
    }

}

export default SubjectType;
