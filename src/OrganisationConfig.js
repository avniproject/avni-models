import _ from 'lodash';

class OrganisationConfig {
    static DEFAULT_SETTINGS = '{"languages": ["en", "hi_IN"]}';

    static schema = {
        name: "OrganisationConfig",
        primaryKey: 'uuid',
        properties: {
            uuid: 'string',
            settings: "string"
        }
    };

    static fromResource(resource) {
        let organisationConfig = new OrganisationConfig();
        organisationConfig.uuid = resource.uuid;
        organisationConfig.settings = _.isNil(resource.settings)
            ? OrganisationConfig.DEFAULT_SETTINGS
            : JSON.stringify(resource.settings);
        return organisationConfig;
    }

    getSettings() {
        return JSON.parse(this.settings);
    }

    clone() {
        let organisationConfig = new OrganisationConfig();
        organisationConfig.uuid = this.uuid;
        organisationConfig.settings = this.settings;
    }
}

export default OrganisationConfig;
