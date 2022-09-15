import _ from "lodash";
import BaseEntity from "./BaseEntity";

class PlatformTranslation extends BaseEntity {
  static schema = {
    name: "PlatformTranslation",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      language: "string",
      platformTranslations: "string",
    },
  };

  constructor(that) {
    super(that);
  }

  get language() {
      return this.that.language;
  }

  set language(x) {
      this.that.language = x;
  }

  get platformTranslations() {
      return this.that.platformTranslations;
  }

  set platformTranslations(x) {
      this.that.platformTranslations = x;
  }

  static fromResource(resource) {
    let platformTranslation = new PlatformTranslation();
    platformTranslation.uuid = resource.uuid;
    platformTranslation.language = resource.language;
    platformTranslation.platformTranslations = _.isNil(resource.translationJson)
      ? "{}"
      : JSON.stringify(resource.translationJson);
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
