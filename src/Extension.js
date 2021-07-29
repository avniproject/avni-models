import BaseEntity from "./BaseEntity";
import General from "./utility/General";


class Extension extends BaseEntity {

    static schema = {
        name: "Extension",
        primaryKey: "url",
        properties: {
            url: "string",
            lastModifiedDateTime: "date",
        },
    };

    static fromResource(resource) {
        return General.assignFields(resource, new Extension(),
            ["url"]
            , ["lastModifiedDateTime"]);
    }

    toJSON() {
        return {
            url: this.url,
            lastModifiedDateTime: this.lastModifiedDateTime
        };
    }
}

export default Extension
