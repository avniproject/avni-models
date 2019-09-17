import _ from 'lodash';

class Translation {
    static UUID = '2abd679d-d5a6-4466-be0b-719dcb8a1294';

    static schema = {
        name: "Translation",
        primaryKey: 'uuid',
        properties: {
            uuid: 'string',
            translations: "string"
        }
    };

    static fromResource(resource) {
        let translation = new Translation();
        translation.uuid = Translation.UUID;
        translation.translations = _.isNil(resource.translationJson) ? '{}' : JSON.stringify(resource.translationJson);
        return translation;
    }

    getTranslations() {
        return JSON.parse(this.translations);
    }

    clone() {
        let translation = new Translation();
        translation.uuid = this.uuid;
        translation.translations = this.translations;
    }
}

export default Translation;
