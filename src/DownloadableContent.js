import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import SchemaNames from "./SchemaNames";

class DownloadableContent extends BaseEntity {
    static schema = {
        name: SchemaNames.DownloadableContent,
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            name: "string",
            category: "string",
            contentKey: {type: "string", optional: true},
            sha256: {type: "string", optional: true},
            needsKey: {type: "bool", default: false},
            payload: {type: "string", optional: true},
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

    get category() {
        return this.that.category;
    }

    set category(x) {
        this.that.category = x;
    }

    get contentKey() {
        return this.that.contentKey;
    }

    set contentKey(x) {
        this.that.contentKey = x;
    }

    get sha256() {
        return this.that.sha256;
    }

    set sha256(x) {
        this.that.sha256 = x;
    }

    get needsKey() {
        return this.that.needsKey;
    }

    set needsKey(x) {
        this.that.needsKey = x;
    }

    get payload() {
        return this.that.payload;
    }

    set payload(x) {
        this.that.payload = x;
    }

    get voided() {
        return this.that.voided;
    }

    set voided(x) {
        this.that.voided = x;
    }

    getPayload() {
        if (!this.payload) {
            return {};
        }
        try {
            const parsed = JSON.parse(this.payload);
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
        } catch (e) {
            return {};
        }
    }

    static fromResource(resource) {
        const content = General.assignFields(resource, new DownloadableContent(),
            ["uuid", "name", "category", "contentKey", "sha256", "voided"]);
        // Coerce: needsKey is a non-optional Realm bool, so an undefined write would abort the sync.
        content.needsKey = resource && resource.needsKey === true;
        // Server sends payload as a JSON object, but tolerate an already-stringified payload too.
        if (resource && resource.payload && typeof resource.payload === 'object') {
            content.payload = JSON.stringify(resource.payload);
        } else if (resource && typeof resource.payload === 'string' && resource.payload.length > 0) {
            content.payload = resource.payload;
        } else {
            content.payload = null;
        }
        return content;
    }
}

export default DownloadableContent;
