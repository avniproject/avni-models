class KeyValue {
  static PrimaryContactKey = "primary_contact";
  static ContactNumberKey = "contact_number";
  static ContactYesValue = "yes";

  static schema = {
    name: "KeyValue",
    properties: {
      key: "string",
      value: "string",
    },
  };

  static fromResource(resource) {
    const keyValue = new KeyValue();
    keyValue.key = resource.key;
    keyValue.value = JSON.stringify(resource.value);
    return keyValue;
  }

  getValue() {
    try {
      return JSON.parse(this.value);
    } catch (e) {
      return this.value;
    }
  }
}

export default KeyValue;
