class BeneficiaryModePin {
  static schema = {
    name: "BeneficiaryModePin",
    properties: {
      pin: "int",
    },
  };

  pinMatches(enteredPin) {
    return enteredPin === this.pin;
  }
}

export default BeneficiaryModePin;
