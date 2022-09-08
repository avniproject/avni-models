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

  mapNonPrimitives(realmObject, entityMapper) {
  }

  static fromResource(resource) {
        return General.assignFields(resource, new Dashboard(),
            ["uuid", "name", "description", "voided"]);
    }
}

export default Dashboard;
