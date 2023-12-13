import EncounterType from "../../src/EncounterType";

class EncounterTypeFactory {
  static create({name, uuid}) {
    const encounterType = new EncounterType();
    encounterType.name = name;
    encounterType.uuid = uuid;
    return encounterType;
  }
}

export default EncounterTypeFactory;
