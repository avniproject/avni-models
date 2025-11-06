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
      locale: { type: 'object', objectType: 'LocaleMapping', optional: true },
      logLevel: "int",
      pageSize: "int",
      poolId: "string",
      clientId: "string",
      idpType: {type: "string", optional: true},
      keycloakAuthServerUrl: {type: "string", optional: true},
      keycloakClientId: {type: "string", optional: true},
      keycloakScope: {type: "string", optional: true},
      keycloakGrantType: {type: "string", optional: true},
      keycloakRealm: {type: "string", optional: true},
      devSkipValidation: {type: "bool", default: false},
      captureLocation: {type: "bool", default: true},
      userId: {type: "string", optional: true},
      accessToken:  {type: "string", optional: true},
      refreshToken:  {type: "string", optional: true},
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
      this.that.locale = this.fromObject(x);
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

  get idpType() {
     return this.that.idpType;
  }

  set idpType(x) {
    this.that.idpType = x;
  }

  get keycloakAuthServerUrl() {
     return this.that.keycloakAuthServerUrl;
  }

  set keycloakAuthServerUrl(x) {
     this.that.keycloakAuthServerUrl = x;
  }

  get keycloakClientId() {
     return this.that.keycloakClientId;
  }

  set keycloakClientId(x) {
     this.that.keycloakClientId = x;
  }

  get keycloakRealm() {
     return this.that.keycloakRealm;
  }

  set keycloakRealm(x) {
     this.that.keycloakRealm = x;
  }

  get keycloakScope() {
    return this.that.keycloakScope;
  }

  set keycloakScope(x) {
    this.that.keycloakScope = x;
  }

  get keycloakGrantType() {
    return this.that.keycloakGrantType;
  }

  set keycloakGrantType(x) {
    this.that.keycloakGrantType = x;
  }

  get accessToken() {
    return this.that.accessToken;
  }

  set accessToken(x) {
    this.that.accessToken = x;
  }

  get refreshToken() {
    return this.that.refreshToken;
  }

  set refreshToken(x) {
    this.that.refreshToken = x;
  }

  get devSkipValidation() {
    return this.that.devSkipValidation;
  }

  set devSkipValidation(x) {
    this.that.devSkipValidation = x;
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
    settings.idpType = this.idpType;
    settings.keycloakRealm = this.keycloakRealm;
    settings.keycloakScope = this.keycloakScope;
    settings.keycloakAuthServerUrl = this.keycloakAuthServerUrl;
    settings.keycloakClientId = this.keycloakClientId;
    settings.keycloakGrantType = this.keycloakGrantType;
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
    if (_.isEmpty(this.idpType))
      validationResults.addOrReplace(ValidationResult.failureForEmpty("idpType"));

    return validationResults;
  }
}

export default Settings;
