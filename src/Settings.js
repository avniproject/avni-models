import ValidationResult from "./application/ValidationResult";
import _ from "lodash";
import ValidationResults from "./application/ValidationResults";
import General from "./utility/General";
import LocaleMapping from "./LocaleMapping";
import BaseEntity from "./BaseEntity";

class Settings extends BaseEntity {
  static UUID = "2aa81079-38c3-4d9f-8380-f50544b32b3d";

  static schema = {
    name: "Settings",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      serverURL: "string",
      locale: {type: "LocaleMapping"},
      logLevel: "int",
      pageSize: "int",
      poolId: "string",
      clientId: "string",
      devSkipValidation: {type: "bool", default: false},
      captureLocation: {type: "bool", default: true},
      userId: {type: "string", optional: true}
    },
  };

   constructor(that = null) {
    super(that);
  }

  get serverURL() {
      return this.that.serverURL;
  }

  set serverURL(x) {
      this.that.serverURL = x;
  }

  get locale() {
      return this.toEntity("locale", LocaleMapping);
  }

  set locale(x) {
      this.that.locale = x && x.that;
  }

  get logLevel() {
      return this.that.logLevel;
  }

  set logLevel(x) {
      this.that.logLevel = x;
  }

  get pageSize() {
      return this.that.pageSize;
  }

  set pageSize(x) {
      this.that.pageSize = x;
  }

  get poolId() {
      return this.that.poolId;
  }

  set poolId(x) {
      this.that.poolId = x;
  }

  get clientId() {
      return this.that.clientId;
  }

  set clientId(x) {
      this.that.clientId = x;
  }

  get devSkipLocation() {
      return this.that.devSkipLocation;
  }

  set devSkipLocation(x) {
      this.that.devSkipLocation = x;
  }

  get captureLocation() {
      return this.that.captureLocation;
  }

  set captureLocation(x) {
      this.that.captureLocation = x;
  }

  get userId() {
      return this.that.userId;
  }

  set userId(x) {
      this.that.userId = x;
  }

  clone() {
    const settings = new Settings();
    settings.uuid = this.uuid;
    settings.serverURL = this.serverURL;
    settings.locale = this.locale;
    settings.logLevel = this.logLevel;
    settings.poolId = this.poolId;
    settings.clientId = this.clientId;
    settings.pageSize = this.pageSize;
    settings.devSkipValidation = this.devSkipValidation;
    settings.captureLocation = this.captureLocation;
    settings.userId = this.userId;
    return settings;
  }

  validate() {
    let validationResults = new ValidationResults([
      ValidationResult.successful("serverURL"),
      ValidationResult.successful("locale"),
      ValidationResult.successful("logLevel"),
    ]);

    if (_.isEmpty(this.serverURL))
      validationResults.addOrReplace(ValidationResult.failureForEmpty("serverURL"));
    if (_.isEmpty(this.locale))
      validationResults.addOrReplace(ValidationResult.failureForEmpty("locale"));
    if (!General.isNumeric(this.logLevel))
      validationResults.addOrReplace(ValidationResult.failureForNumeric("logLevel"));

    return validationResults;
  }
}

export default Settings;
