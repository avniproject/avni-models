import General from "./utility/General";
import _ from "lodash";
import BaseEntity from "./BaseEntity";

class RuleFailureTelemetry extends BaseEntity {
  static schema = {
    name: "RuleFailureTelemetry",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      ruleUuid: "string",
      individualUuid: "string",
      errorMessage: "string",
      stacktrace: "string",
      closed: {type: "bool", default: false},
      errorDateTime: "date",
      sourceType: "string",
      sourceId: "string",
      entityType: "string",
      entityId: "string",
      appType: "string",
    },
  };

  constructor(that = null) {
    super(that);
  }

  get ruleUuid() {
      return this.that.ruleUuid;
  }

  set ruleUuid(x) {
      this.that.ruleUuid = x;
  }

  get individualUuid() {
      return this.that.individualUuid;
  }

  set individualUuid(x) {
      this.that.individualUuid = x;
  }

  get errorMessage() {
      return this.that.errorMessage;
  }

  set errorMessage(x) {
      this.that.errorMessage = x;
  }

  get stacktrace() {
      return this.that.stacktrace;
  }

  set stacktrace(x) {
      this.that.stacktrace = x;
  }

  get closed() {
      return this.that.closed;
  }

  set closed(x) {
      this.that.closed = x;
  }

  get errorDateTime() {
      return this.that.errorDateTime;
  }

  set errorDateTime(x) {
      this.that.errorDateTime = x;
  }

  get sourceType() {
    return this.that.sourceType;
  }

  set sourceType(x) {
    this.that.sourceType = x;
  }

  get sourceId() {
    return this.that.sourceId;
  }

  set sourceId(x) {
    this.that.sourceId = x;
  }

  get entityType() {
    return this.that.entityType;
  }

  set entityType(x) {
    this.that.entityType = x;
  }

  get entityId() {
    return this.that.entityId;
  }

  set entityId(x) {
    this.that.entityId = x;
  }

  get appType() {
    return this.that.appType;
  }

  set appType(x) {
    this.that.appType = x;
  }

  static create({ruleUUID, individualUUID, errorMessage, stacktrace, sourceType, sourceId, entityType, entityId, appType}) {
    const ruleFailureTelemetry = new RuleFailureTelemetry();
    ruleFailureTelemetry.uuid = General.randomUUID();
    ruleFailureTelemetry.closed = false;
    ruleFailureTelemetry.ruleUuid = ruleUUID;
    ruleFailureTelemetry.individualUuid = individualUUID;
    ruleFailureTelemetry.errorMessage = errorMessage;
    ruleFailureTelemetry.stacktrace = stacktrace;
    ruleFailureTelemetry.errorDateTime = new Date();
    ruleFailureTelemetry.sourceType = sourceType;
    ruleFailureTelemetry.sourceId = sourceId;
    ruleFailureTelemetry.entityType = entityType;
    ruleFailureTelemetry.entityId = entityId;
    ruleFailureTelemetry.appType = appType;
    return ruleFailureTelemetry;
  }

  get toResource() {
    return _.pick(this, [
      "uuid",
      "ruleUuid",
      "individualUuid",
      "errorMessage",
      "stacktrace",
      "closed",
      "errorDateTime",
      "sourceType",
      "sourceId",
      "entityType",
      "entityId",
      "appType",
    ]);
  }

  clone() {
    const ruleFailureTelemetry = new RuleFailureTelemetry();
    ruleFailureTelemetry.uuid = this.uuid;
    ruleFailureTelemetry.ruleUuid = this.ruleUuid;
    ruleFailureTelemetry.individualUuid = this.individualUuid;
    ruleFailureTelemetry.errorMessage = this.errorMessage;
    ruleFailureTelemetry.stacktrace = this.stacktrace;
    ruleFailureTelemetry.closed = this.closed;
    ruleFailureTelemetry.errorDateTime = this.errorDateTime;
    ruleFailureTelemetry.sourceType = this.sourceType;
    ruleFailureTelemetry.sourceId = this.sourceId;
    ruleFailureTelemetry.entityType = this.entityType;
    ruleFailureTelemetry.entityId = this.entityId;
    ruleFailureTelemetry.appType = this.appType;
    return ruleFailureTelemetry;
  }
}

export default RuleFailureTelemetry;
