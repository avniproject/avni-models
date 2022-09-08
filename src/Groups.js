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

  static fromResource(resource) {
    let groups = new Groups();
    groups.uuid = resource.uuid;
    groups.name = resource.name;
    groups.hasAllPrivileges = resource.hasAllPrivileges;
    return groups;
  }

  mapNonPrimitives(realmObject) {
  }
}

export default Groups;
