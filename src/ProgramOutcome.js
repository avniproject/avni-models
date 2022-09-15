import ReferenceEntity from "./ReferenceEntity";

class ProgramOutcome extends ReferenceEntity {
  static schema = {
    name: "ProgramOutcome",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      name: "string",
    },
  };

  constructor(that) {
    super(that);
  }

  get name() {
      return this.that.name;
  }

  set name(x) {
      this.that.name = x;
  }
}

export default ProgramOutcome;
