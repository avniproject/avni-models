import _ from 'lodash';

class OrganisationConfig {
    static DEFAULT_SETTINGS = '{"languages": ["en", "hi_IN"]}';
    static UUID = "06177b7c-76b9-42ac-b9a4-b5af3cfcb902";

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
        organisationConfig.uuid = OrganisationConfig.UUID;
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
