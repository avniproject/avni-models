import SubjectType from "../../src/SubjectType";

class SubjectTypeFactory {
  static create({uuid, name}) {
    const subjectType = new SubjectType();
    subjectType.uuid = uuid;
    subjectType.name = name;
    return subjectType;
  }
}

export default SubjectTypeFactory;
