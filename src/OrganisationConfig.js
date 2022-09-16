import _ from "lodash";
import BaseEntity from "./BaseEntity";

class OrganisationConfig extends BaseEntity{
  static DEFAULT_SETTINGS = '{"languages": ["en", "hi_IN"]}';
  static UUID = "06177b7c-76b9-42ac-b9a4-b5af3cfcb902";

  static schema = {
    name: "OrganisationConfig",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      settings: "string",
      worklistUpdationRule: "string",
    },
  };

   constructor(that = null) {
    super(that);
  }

  get settings() {
      return this.that.settings;
  }

  set settings(x) {
      this.that.settings = x;
  }

  get worklistUpdationRule() {
      return this.that.worklistUpdationRule;
  }

  set worklistUpdationRule(x) {
      this.that.worklistUpdationRule = x;
  }

  static fromResource(resource) {
    let organisationConfig = new OrganisationConfig();
    organisationConfig.uuid = OrganisationConfig.UUID;
    organisationConfig.settings = _.isNil(resource.settings)
      ? OrganisationConfig.DEFAULT_SETTINGS
      : JSON.stringify(resource.settings);
    organisationConfig.worklistUpdationRule = resource.worklistUpdationRule
      ? resource.worklistUpdationRule
      : "";
    return organisationConfig;
  }

  getSettings() {
    return JSON.parse(this.settings);
  }

  clone() {
    let organisationConfig = new OrganisationConfig();
    organisationConfig.uuid = this.uuid;
    organisationConfig.settings = this.settings;
    organisationConfig.worklistUpdationRule = this.worklistUpdationRule
      ? this.worklistUpdationRule
      : "";
  }
}

export default OrganisationConfig;
