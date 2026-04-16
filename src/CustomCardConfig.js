import BaseEntity from "./BaseEntity";
import General from "./utility/General";

class CustomCardConfig extends BaseEntity {
    static schema = {
        name: "CustomCardConfig",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            name: "string",
            htmlFileS3Key: "string",
            dataRule: {type: "string", optional: true},
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

    get htmlFileS3Key() {
        return this.that.htmlFileS3Key;
    }

    set htmlFileS3Key(x) {
        this.that.htmlFileS3Key = x;
    }

    get dataRule() {
        return this.that.dataRule;
    }

    set dataRule(x) {
        this.that.dataRule = x;
    }

    static fromResource(resource) {
        return General.assignFields(resource, new CustomCardConfig(),
            ["uuid", "name", "htmlFileS3Key", "dataRule", "voided"]);
    }
}

export default CustomCardConfig;
