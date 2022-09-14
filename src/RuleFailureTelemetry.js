import General from "./utility/General";
import _ from "lodash";
import BaseEntity from "./BaseEntity";

class RuleFailureTelemetry extends BaseEntity{
  static schema = {
    name: "RuleFailureTelemetry",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      ruleUuid: "string",
      individualUuid: "string",
      errorMessage: "string",
      stacktrace: "string",
      closed: { type: "bool", default: false },
      errorDateTime: "date",
    },
  };

  static create({ ruleUUID, individualUUID, errorMessage, stacktrace }) {
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
