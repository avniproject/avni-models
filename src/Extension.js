import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import SchemaNames from "./SchemaNames";

//Should not be a BaseEntity
class Extension extends BaseEntity {
    static schema = {
        name: SchemaNames.Extension,
        primaryKey: "url",
        properties: {
            url: "string",
            lastModifiedDateTime: "date",
        },
    };

    constructor(that = null) {
        super(that);
    }

    get url() {
        return this.that.url;
    }

    set url(x) {
        this.that.url = x;
    }

    get lastModifiedDateTime() {
        return this.that.lastModifiedDateTime;
    }

    set lastModifiedDateTime(x) {
        this.that.lastModifiedDateTime = x;
    }

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
