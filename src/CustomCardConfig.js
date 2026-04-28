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
            translations: {type: "string", optional: true},
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

    get translations() {
        return this.that.translations;
    }

    set translations(x) {
        this.that.translations = x;
    }

    getTranslations() {
        if (!this.translations) {
            return {};
        }
        try {
            const parsed = JSON.parse(this.translations);
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
        } catch (e) {
            return {};
        }
    }

    static fromResource(resource) {
        const config = General.assignFields(resource, new CustomCardConfig(),
            ["uuid", "name", "htmlFileS3Key", "dataRule", "voided"]);
        if (resource && "translations" in resource) {
            config.translations = resource.translations && typeof resource.translations === 'object'
                ? JSON.stringify(resource.translations)
                : null;
        }
        return config;
    }
}

export default CustomCardConfig;
