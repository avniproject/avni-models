import BaseEntity from "./BaseEntity";
import General from "./utility/General";

class Dashboard extends BaseEntity {

    static schema = {
        name: "Dashboard",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            name: "string",
            description: {type: "string", optional: true},
            voided: {type: "bool", default: false},
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

  get description() {
      return this.that.description;
  }

  set description(x) {
      this.that.description = x;
  }

  static fromResource(resource) {
        return General.assignFields(resource, new Dashboard(),
            ["uuid", "name", "description", "voided"]);
    }
}

export default Dashboard;
