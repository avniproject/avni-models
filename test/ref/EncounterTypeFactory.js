import {EncounterType} from "openchs-models";

class EncounterTypeFactory {
  static create({name, uuid}) {
    const encounterType = new EncounterType();
    encounterType.name = name;
    encounterType.uuid = uuid;
    return encounterType;
  }
}

export default EncounterTypeFactory;
