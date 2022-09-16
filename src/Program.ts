import ReferenceEntity from "./ReferenceEntity";
import _ from "lodash";
import General from "./utility/General";

class Program extends ReferenceEntity {
  static schema = {
    name: 'Program',
    primaryKey: 'uuid',
    properties: {
      uuid: 'string',
      name: 'string',
      operationalProgramName: {type: 'string', optional: true},
      displayName: 'string',
      colour: 'string',
      programSubjectLabel: 'string',
      enrolmentSummaryRule: {type: 'string', optional: true},
      enrolmentEligibilityCheckRule: {type: 'string', optional: true},
      manualEligibilityCheckRequired: 'bool',
      manualEnrolmentEligibilityCheckRule: {type: 'string', optional: true},
      voided: {type: 'bool', default: false},
      active: {type: 'bool', default: true}
    }
  };

  constructor(that = null) {
    super(that);
  }

  get name() {
      return this.that.name;
  }

  set name(x) {
      this.that.name = x;
  }

  get operationalProgramName() {
      return this.that.operationalProgramName;
  }

  set operationalProgramName(x) {
      this.that.operationalProgramName = x;
  }

  get displayName() {
      return this.that.displayName;
  }

  set displayName(x) {
      this.that.displayName = x;
  }

  get colour() {
      return this.that.colour;
  }

  set colour(x) {
      this.that.colour = x;
  }

  get programSubjectLabel() {
      return this.that.programSubjectLabel;
  }

  set programSubjectLabel(x) {
      this.that.programSubjectLabel = x;
  }

  get manualEligibilityCheckRequired() {
      return this.that.manualEligibilityCheckRequired;
  }

  set manualEligibilityCheckRequired(x) {
      this.that.manualEligibilityCheckRequired = x;
  }

  get enrolmentSummaryRule() {
      return this.that.enrolmentSummaryRule;
  }

  set enrolmentSummaryRule(x) {
      this.that.enrolmentSummaryRule = x;
  }

  get enrolmentEligibilityCheckRule() {
      return this.that.enrolmentEligibilityCheckRule;
  }

  set enrolmentEligibilityCheckRule(x) {
      this.that.enrolmentEligibilityCheckRule = x;
  }

  get manualEnrolmentEligibilityCheckRule() {
      return this.that.manualEnrolmentEligibilityCheckRule;
  }

  set manualEnrolmentEligibilityCheckRule(x) {
      this.that.manualEnrolmentEligibilityCheckRule = x;
  }

  get active() {
      return this.that.active;
  }

  set active(x) {
      this.that.active = x;
  }

  static fromResource(operationalProgram): Program {
    const program = new Program();
    program.uuid = operationalProgram.programUUID;
    program.name = operationalProgram.programName;
    program.operationalProgramName = operationalProgram.name;
    program.colour = _.isNil(operationalProgram.colour)
      ? Program.randomColour()
      : operationalProgram.colour;
    program.displayName = _.isEmpty(program.operationalProgramName)
      ? program.name
      : program.operationalProgramName;
    program.programSubjectLabel =
      operationalProgram.programSubjectLabel || operationalProgram.name || program.name;
    program.enrolmentSummaryRule = operationalProgram.enrolmentSummaryRule;
    program.manualEligibilityCheckRequired = operationalProgram.manualEligibilityCheckRequired;
    program.manualEnrolmentEligibilityCheckRule = operationalProgram.manualEnrolmentEligibilityCheckRule;
    program.enrolmentEligibilityCheckRule = operationalProgram.enrolmentEligibilityCheckRule;
    program.active = operationalProgram.active;
    program.voided = operationalProgram.programVoided;
    return program;
  }

  static randomColour() {
    return (
      "rgb(" +
      Math.floor(Math.random() * 256) +
      "," +
      Math.floor(Math.random() * 256) +
      "," +
      Math.floor(Math.random() * 256) +
      ")"
    );
  }

  clone() {
    return General.assignFields(this, super.clone(new Program()), [
      "operationalProgramName",
      "displayName",
    ]);
  }

  static addTranslation(program, messageService) {
    messageService.addTranslation("en", program.displayName, program.displayName);
  }
}

export default Program;
