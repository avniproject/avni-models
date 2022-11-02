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

  static create({ruleUUID, individualUUID, errorMessage, stacktrace}) {
    const ruleFailureTelemetry = new RuleFailureTelemetry();
    ruleFailureTelemetry.uuid = General.randomUUID();
    ruleFailureTelemetry.closed = false;
    ruleFailureTelemetry.ruleUuid = ruleUUID;
    ruleFailureTelemetry.individualUuid = individualUUID;
    ruleFailureTelemetry.errorMessage = errorMessage;
    ruleFailureTelemetry.stacktrace = stacktrace;
    ruleFailureTelemetry.errorDateTime = new Date();
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
    return ruleFailureTelemetry;
  }
}

export default RuleFailureTelemetry;
