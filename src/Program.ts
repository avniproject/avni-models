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
  uuid: string;
  name: string;
  operationalProgramName: string;
  colour: string;
  displayName: string;
  programSubjectLabel: string;
  enrolmentSummaryRule: string;
  enrolmentEligibilityCheckRule: string;
  active: boolean;
  voided: boolean;
  manualEligibilityCheckRequired: boolean;
  manualEnrolmentEligibilityCheckRule: string;

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
