import General from "../utility/General";
import BaseEntity from "../BaseEntity";
import SchemaNames from "../SchemaNames";

class MenuItem extends BaseEntity{
  static FunctionalityGroupName = "Functionality";
  static SyncGroupName = "Sync";
  static UserGroupName = "User";
  static SupportGroupName = "Support";
  static HyperlinkTypeName = "Link";

  static schema = {
    name: SchemaNames.MenuItem,
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

   constructor(that = null) {
    super(that);
  }

  get displayKey() {
      return this.that.displayKey;
  }

  set displayKey(x) {
      this.that.displayKey = x;
  }

  get type() {
      return this.that.type;
  }

  set type(x) {
      this.that.type = x;
  }

  get icon() {
      return this.that.icon;
  }

  set icon(x) {
      this.that.icon = x;
  }

  get group() {
      return this.that.group;
  }

  set group(x) {
      this.that.group = x;
  }

  get linkFunction() {
      return this.that.linkFunction;
  }

  set linkFunction(x) {
      this.that.linkFunction = x;
  }

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
