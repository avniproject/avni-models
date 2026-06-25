import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import SchemaNames from "./SchemaNames";

/**
 * Client mirror of the server's downloadable-content reference data
 * (avniproject/avni-server#1019, avniproject/avni-models#67).
 *
 * Generic admin-configured metadata that declares a downloadable blob (e.g. an edge model).
 * Synced to every device as reference/metadata data. The bytes referenced by {@code contentKey}
 * are fetched during sync by the content-download capability (avniproject/avni-client#1948).
 *
 * The AES key for an encrypted blob is NEVER a field here - it lives in a server-only key
 * store served via a device key-delivery endpoint (avniproject/avni-server#1020).
 *
 * {@code payload} is category-specific non-secret metadata (for the edge model:
 * engine / inputShape / labelMap). Stored as a JSON string on Realm (mirrors how
 * {@link CustomCardConfig} stores its {@code translations} JSON object).
 */
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

    /**
     * Parsed {@code payload} JSON as an object (empty object when absent/invalid).
     * Consumers (the edge-model consumer, avniproject/avni-client#1949) read engine /
     * inputShape / labelMap from here.
     */
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
        // needsKey is a non-optional Realm bool. The server may omit/null it; a direct field
        // copy would write `undefined`, which throws on the Realm write and aborts the entire
        // reference-data sync. Coerce explicitly so absent/null -> false, never undefined.
        content.needsKey = resource && resource.needsKey === true;
        // payload is category-specific metadata. The server normally sends it as a JSON object
        // (JsonObject -> Map), but may serialize it as an already-JSON string. Handle both so
        // metadata is never silently dropped: object -> stringify; non-empty string -> store as-is.
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
