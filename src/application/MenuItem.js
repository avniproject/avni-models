import General from "../utility/General";

class MenuItem {
  static FunctionalityGroupName = "Functionality";
  static SyncGroupName = "Sync";
  static UserGroupName = "User";
  static SupportGroupName = "Support";

  static schema = {
    name: "MenuItem",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      displayKey: "string",
      type: "string",
      icon: {type: "string", optional: true},
      group: "string",
      link: {type: "string", optional: true},
      voided: {type: 'bool', default: false}
    }
  };

  static fromResource(resource, entityService) {
    return  General.assignFields(resource, new MenuItem(), ['uuid', 'displayKey', 'type', 'icon', "voided", "group", "link"]);
  }
}

export default MenuItem;
