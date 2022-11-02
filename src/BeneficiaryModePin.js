import PersistedObject from "./PersistedObject";
import SchemaNames from "./SchemaNames";

class BeneficiaryModePin extends PersistedObject {
  static schema = {
    name: SchemaNames.BeneficiaryModePin,
    properties: {
      pin: "int",
    },
  };

   constructor(that = null) {
    super(that);
  }

  get pin() {
      return this.that.pin;
  }

  set pin(x) {
      this.that.pin = x;
  }

  pinMatches(enteredPin) {
    return enteredPin === this.pin;
  }
}

export default BeneficiaryModePin;
