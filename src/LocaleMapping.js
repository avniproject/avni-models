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

  constructor(that) {
    super(that);
  }

  get locale() {
      return this.that.locale;
  }

  set locale(x) {
      this.that.locale = x;
  }

  get displayText() {
      return this.that.displayText;
  }

  set displayText(x) {
      this.that.displayText = x;
  }
}
