import _ from "lodash";
import BaseEntity from "./BaseEntity";

class Translation extends BaseEntity {
  static schema = {
    name: "Translation",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      language: "string",
      translations: "string",
    },
  };

  static fromResource(resource) {
    let translation = new Translation();
    translation.uuid = resource.uuid;
    translation.language = resource.language;
    translation.translations = _.isNil(resource.translationJson)
      ? "{}"
      : JSON.stringify(resource.translationJson);
    return translation;
  }

  getTranslations() {
    return JSON.parse(this.translations);
  }

  clone() {
    let translation = new Translation();
    translation.uuid = this.uuid;
    translation.language = this.language;
    translation.translations = this.translations;
  }

  mapNonPrimitives() {
  }
}

export default Translation;
