import BaseEntity from "./BaseEntity";

export default class LocaleMapping extends BaseEntity {
  static schema = {
    name: "LocaleMapping",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      locale: "string",
      displayText: "string",
    },
  };
}
