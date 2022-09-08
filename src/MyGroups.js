import BaseEntity from "./BaseEntity";

class MyGroups extends BaseEntity{
  static schema = {
    name: "MyGroups",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      groupUuid: "string",
      groupName: "string",
      voided: { type: "bool", default: false },
    },
  };

  mapNonPrimitives(realmObject, entityMapper) {
  }

  static fromResource(resource) {
    let myGroups = new MyGroups();
    myGroups.uuid = resource.uuid;
    myGroups.groupUuid = resource.groupUuid;
    myGroups.groupName = resource.groupName;
    myGroups.voided = resource.voided;
    return myGroups;
  }
}

export default MyGroups;
