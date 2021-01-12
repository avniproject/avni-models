import BaseEntity from "./BaseEntity";
import General from "./utility/General";

class Dashboard extends BaseEntity {

    static schema = {
        name: "Dashboard",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            name: "string",
            description: "string",
            voided: {type: "bool", default: false},
        },
    };

    static fromResource(resource) {
        return General.assignFields(resource, new Dashboard(),
            ["uuid", "name", "description", "voided"]);
    }
}

export default Dashboard;
