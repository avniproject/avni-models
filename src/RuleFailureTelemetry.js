import General from "./utility/General";
import _ from "lodash";


class RuleFailureTelemetry {


  static schema = {
    name: "RuleFailureTelemetry",
    primaryKey: 'uuid',
    properties: {
      uuid: 'string',
      ruleUuid: 'string',
      individualUuid: 'string',
      errorMessage: 'string',
      stacktrace: "string",
      status: "string"
    }
  };

  static create({ruleUUID, individualUUID, errorMessage, stacktrace}) {
    const ruleFailureTelemetry = new RuleFailureTelemetry();
    ruleFailureTelemetry.uuid = General.randomUUID();
    ruleFailureTelemetry.status = 'open';
    ruleFailureTelemetry.ruleUuid = ruleUUID;
    ruleFailureTelemetry.individualUuid = individualUUID;
    ruleFailureTelemetry.errorMessage = errorMessage;
    ruleFailureTelemetry.stacktrace = stacktrace;
    return ruleFailureTelemetry;
  }

  get toResource() {
    return _.pick(this, ["uuid", "ruleUuid", "individualUuid", "errorMessage", "stacktrace", "status"]);
  }

  clone() {
    const ruleFailureTelemetry = new RuleFailureTelemetry();
    ruleFailureTelemetry.uuid = this.uuid;
    ruleFailureTelemetry.ruleUuid = this.ruleUuid;
    ruleFailureTelemetry.individualUuid = this.individualUuid;
    ruleFailureTelemetry.errorMessage = this.errorMessage;
    ruleFailureTelemetry.stacktrace = this.stacktrace;
    ruleFailureTelemetry.status = this.status;
    return ruleFailureTelemetry;
  }
}

export default RuleFailureTelemetry;
