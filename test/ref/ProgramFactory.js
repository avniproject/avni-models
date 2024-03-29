import Program from "../../src/Program";

class ProgramFactory {
  static create({name, uuid}) {
    const program = new Program();
    program.name = name;
    program.uuid = uuid;
    return program;
  }
}

export default ProgramFactory;
