import BaseEntity from "./BaseEntity";
import General from "./utility/General";

export default class ConceptMedia extends BaseEntity {
    static schema = {
        name: "ConceptMedia",
        embedded: true,
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            url: {type: "string", optional: true},
            type: {type: "string", optional: true},
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

    get type() {
        return this.that.type;
    }

    set type(x) {
        this.that.type = x;
    }

    static fromResource(resource) {
        const conceptMedia = new ConceptMedia();
        conceptMedia.uuid = resource.uuid || General.randomUUID();
        conceptMedia.url = resource.url;
        conceptMedia.type = resource.type;
        return conceptMedia;
    }

    isImage() {
        return this.type === 'Image';
    }

    isVideo() {
        return this.type === 'Video';
    }
}
