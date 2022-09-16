import BaseEntity from "./BaseEntity";

class Groups extends BaseEntity{
  static schema = {
    name: "Groups",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      name: "string",
      hasAllPrivileges: { type: "bool", default: false },
    },
  };

   constructor(that = null) {
    super(that);
  }

  get name() {
      return this.that.name;
  }

  set name(x) {
      this.that.name = x;
  }

  get hasAllPrivileges() {
      return this.that.hasAllPrivileges;
  }

  set hasAllPrivileges(x) {
      this.that.hasAllPrivileges = x;
  }

  static fromResource(resource) {
    let groups = new Groups();
    groups.uuid = resource.uuid;
    groups.name = resource.name;
    groups.hasAllPrivileges = resource.hasAllPrivileges;
    return groups;
  }
}

export default Groups;
