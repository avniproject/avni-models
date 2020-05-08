import _ from "lodash";

class PlatformTranslation {
  static schema = {
    name: "PlatformTranslation",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      language: "string",
      platformTranslations: "string",
    },
  };

  static fromResource(resource) {
    let platformTranslation = new PlatformTranslation();
    platformTranslation.uuid = resource.uuid;
    platformTranslation.language = resource.language;
    if (resource.platform === "Android") {
      platformTranslation.platformTranslations = _.isNil(resource.translationJson)
        ? "{}"
        : JSON.stringify(resource.translationJson);
    }
    return platformTranslation;
  }

  getTranslations() {
    return JSON.parse(this.platformTranslations);
  }

  clone() {
    let platformTranslation = new PlatformTranslation();
    platformTranslation.uuid = this.uuid;
    platformTranslation.language = this.language;
    platformTranslation.platformTranslations = this.platformTranslations;
  }
}

export default PlatformTranslation;
