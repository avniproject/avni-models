import General from "../utility/General";
import BaseEntity from "../BaseEntity";

class MenuItem extends BaseEntity{
  static FunctionalityGroupName = "Functionality";
  static SyncGroupName = "Sync";
  static UserGroupName = "User";
  static SupportGroupName = "Support";

  static HyperlinkTypeName = "Link";

  id;
  uuid;
  displayKey;
  type;
  icon;
  group;
  linkFunction;
  voided;

  static schema = {
    name: "MenuItem",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      displayKey: "string",
      type: "string",
      icon: {type: "string", optional: true},
      group: "string",
      linkFunction: {type: "string", optional: true},
      voided: {type: 'bool', default: false}
    }
  };

  static fromResource(resource, entityService) {
    return this.assignFields(resource, new MenuItem());
  }

  static assignFields(source, menuItem) {
    const assigned = General.assignFields(source, menuItem, ['uuid', 'displayKey', 'type', 'icon', "voided", "group", "linkFunction"]);
    if (source.id)
      menuItem.id = source.id;
    return assigned;
  }

  static fromDb(obj) {
    return MenuItem.fromResource(obj);
  }

  toString() {
    return `uuid:${this.uuid}; displayKey:${this.displayKey}; type:${this.type}; group:${this.group}; voided:${this.voided}`;
  }

  isLinkType() {
    return this.type === MenuItem.HyperlinkTypeName;
  }

  static getAllGroups() {
    return [this.FunctionalityGroupName, this.SyncGroupName, this.UserGroupName, this.SupportGroupName];
  }

  static getAllTypes() {
    return [this.HyperlinkTypeName];
  }

  clone() {
    return MenuItem.assignFields(this, new MenuItem());
  }
}

export default MenuItem;
