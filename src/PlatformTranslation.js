import _ from 'lodash';

class PlatformTranslation {
    static UUID = 'eefe00cb-5dcc-4c17-8c46-6e80d6bde2c1';

    static schema = {
        name: "PlatformTranslation",
        primaryKey: 'uuid',
        properties: {
            uuid: 'string',
            platformTranslations: "string"
        }
    };

    static fromResource(resource) {
        let platformTranslation = new PlatformTranslation();
        platformTranslation.uuid = PlatformTranslation.UUID;
        if (resource.platform === 'Android') {
            platformTranslation.platformTranslations = _.isNil(resource.translationJson) ? '{}' : JSON.stringify(resource.translationJson);
        }
        return platformTranslation;
    }

    getTranslations() {
        return JSON.parse(this.platformTranslations);
    }

    clone() {
        let platformTranslation = new PlatformTranslation();
        platformTranslation.uuid = this.uuid;
        platformTranslation.platformTranslations = this.platformTranslations;
    }

}

export default PlatformTranslation;
