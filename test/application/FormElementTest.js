import { assert } from "chai";
import EntityFactory from "../EntityFactory";
import { Concept } from "../../src";
import General from "../../src/utility/General";
import moment from "moment";
import Format from "../../src/application/Format";

const createFormElement = (dataType, mandatory) => {
  const concept = EntityFactory.createConcept("Concept", dataType, General.randomUUID());
  return EntityFactory.createFormElement("Form Element", mandatory, concept, 1);
};

const createNumericFormElement = (mandatory, hiAbsolute, lowAbsolute) => {
  const formElement = createFormElement(Concept.dataType.Numeric, mandatory);
  formElement.concept.hiAbsolute = hiAbsolute;
  formElement.concept.lowAbsolute = lowAbsolute;
  return formElement;
};

const createTextFormElement = (mandatory, regex, descriptionKey) => {
  const formElement = createFormElement(Concept.dataType.Text, mandatory);
  formElement.validFormat = Format.fromResource({regex, descriptionKey});
  return formElement;
};

const assertSuccess = result => {
  assert.isTrue(result.success);
  assert.equal(result.messageKey, null);
}

const assertFailure = (result, expectedMessageKey) => {
  assert.isFalse(result.success);
  assert.equal(result.messageKey, expectedMessageKey);
}

describe("FormElementTest", () => {
    describe("Form Element Type Test", () => {
        it("Should return concept type if concept is of type Numeric", () => {
            const numericConcept = EntityFactory.createConcept("Numeric Concept", Concept.dataType.Numeric, "af7d8c4f-9513-47b8-8ef2-4c964ca708be");
            const formElement = EntityFactory.createFormElement("Numeric Form Element", true, numericConcept, 1);
            const formElementType = formElement.getType();
            assert.equal(Concept.dataType.Numeric, formElementType);
        });

        it("Should return concept type if concept is of type Text", () => {
            const textConcept = EntityFactory.createConcept("Text Concept", Concept.dataType.Text, "fea4897f-e5ec-404e-af19-babfc59c2420");
            const formElement = EntityFactory.createFormElement("Text Form Element", true, textConcept, 1);
            const formElementType = formElement.getType();
            assert.equal(Concept.dataType.Text, formElementType);
        });

        it("Should return concept type if concept is of type Date", () => {
            const dateConcept = EntityFactory.createConcept("Date Concept", Concept.dataType.Date, "9ac36dba-8645-445f-935a-b5faf6bc1d17");
            const formElement = EntityFactory.createFormElement("Date Form Element", true, dateConcept, 1);
            const formElementType = formElement.getType();
            assert.equal(Concept.dataType.Date, formElementType);
        });

        it("Should return concept type if concept is of type Duration", () => {
            const durationConcept = EntityFactory.createConcept("Duration Concept", Concept.dataType.Duration, "bca500eb-541c-4d0a-baf6-5aa18c8230f2");
            const formElement = EntityFactory.createFormElement("Numeric Form Element", true, durationConcept, 1);
            const formElementType = formElement.getType();
            assert.equal(Concept.dataType.Duration, formElementType);
        });

        it("Should return form type if concept is of type Coded", () => {
            const codedConcept = EntityFactory.createConcept("Coded Concept", Concept.dataType.Coded, "af7d8c4f-9513-47b8-8ef2-4c964ca708be");
            let formElement = EntityFactory.createFormElement("Single Select Form Element", true, codedConcept, 1, "SingleSelect");
            let formElementType = formElement.getType();
            assert.equal("SingleSelect", formElementType);

            formElement = EntityFactory.createFormElement("Multi Select Form Element", true, codedConcept, 1, "SingleSelect");
            formElementType = formElement.getType();
            assert.equal("SingleSelect", formElementType);
        });
    });

    describe("FormElement.validate Numeric Concept", () => {
      let dataType = Concept.dataType.Numeric;

      it("should return success true if passed valid value on mandatory element", () => {
        const mandatory = true;
        assertSuccess(createFormElement(dataType, mandatory).validate(5.5));
      });

      it("should return success false if passed invalid value on mandatory element", () => {
        const mandatory = true;
        assertFailure(createFormElement(dataType, mandatory).validate("abc"), "numericValueValidation");
      });

      it("should return success false if passed empty or null value on mandatory element", () => {
        const mandatory = true;
        assertFailure(createFormElement(dataType, mandatory).validate(""), "emptyValidationMessage");
        assertFailure(createFormElement(dataType, mandatory).validate(null), "emptyValidationMessage");
      });

      it("should return success false if passed value fails low or high absolute check on mandatory element", () => {
        const mandatory = true;
        assertFailure(createNumericFormElement(mandatory, 5, 5).validate(3), "numberBelowLowAbsolute");
        assertFailure(createNumericFormElement(mandatory, 5, 5).validate(6), "numberAboveHiAbsolute");
      });

      it("should return success true if passed valid value on non mandatory element", () => {
        const mandatory = false;
        assertSuccess(createFormElement(dataType, mandatory).validate(5.5));
      });

      it("should return success false if passed invalid value on non mandatory element", () => {
        const mandatory = false;
        assertFailure(createFormElement(dataType, mandatory).validate("abc"), "numericValueValidation");
      });

      it("should return success true if passed empty or null on non mandatory element", () => {
        const mandatory = false;
        assertSuccess(createFormElement(dataType, mandatory).validate(null));
      });
    });

  describe("FormElement.validate Date Concept", () => {
    let dataType = Concept.dataType.Date;

    it("should return success true if passed valid value on mandatory element", () => {
      const mandatory = true;
      assertSuccess(createFormElement(dataType, mandatory).validate("2020-02-29"));
      assertSuccess(createFormElement(dataType, mandatory).validate("2020-12-31"));
      assertSuccess(createFormElement(dataType, mandatory).validate("2020-1-1"));
    });

    it("should return success false if passed invalid value on mandatory element", () => {
      const mandatory = true;
      assertFailure(createFormElement(dataType, mandatory).validate("2020-02-30"), "invalidDateFormat");
      assertFailure(createFormElement(dataType, mandatory).validate("2019-02-29"), "invalidDateFormat");
      assertFailure(createFormElement(dataType, mandatory).validate("2019-13-01"), "invalidDateFormat");
    });

    it("should return success false if passed empty or null value on mandatory element", () => {
      const mandatory = true;
      assertFailure(createFormElement(dataType, mandatory).validate(""), "emptyValidationMessage");
      assertFailure(createFormElement(dataType, mandatory).validate(null), "emptyValidationMessage");
    });

    it("should return success true if passed valid value on non mandatory element", () => {
      const mandatory = false;
      assertSuccess(createFormElement(dataType, mandatory).validate("2020-02-29"));
    });

    it("should return success false if passed invalid value on non mandatory element", () => {
      const mandatory = false;
      assertFailure(createFormElement(dataType, mandatory).validate("2020-02-30"), "invalidDateFormat");
      assertFailure(createFormElement(dataType, mandatory).validate("2019-02-29"), "invalidDateFormat");
      assertFailure(createFormElement(dataType, mandatory).validate("2019-13-01"), "invalidDateFormat");
    });

    it("should return success true if passed empty or null on non mandatory element", () => {
      const mandatory = false;
      assertSuccess(createFormElement(dataType, mandatory).validate(null));
      assertSuccess(createFormElement(dataType, mandatory).validate(undefined));
    });

  });

  describe("FormElement.validate DateTime Concept", () => {
    let dataType = Concept.dataType.DateTime;

    it("should return success true if passed valid value on mandatory element", () => {
      const mandatory = true;
      assertSuccess(createFormElement(dataType, mandatory).validate(new Date("2020-02-29 12:00")));
      assertSuccess(createFormElement(dataType, mandatory).validate(new Date("2020-02-29 23:59")));
    });

    it("should return success false if passed invalid value on mandatory element", () => {
      const mandatory = true;
      assertFailure(createFormElement(dataType, mandatory).validate(new Date("2020-01-01 24:52")), "invalidDateTimeFormat");
      assertFailure(createFormElement(dataType, mandatory).validate(new Date("2020-01-01 12:95")), "invalidDateTimeFormat");
      assertFailure(createFormElement(dataType, mandatory).validate(new Date("2020-25-30 01:53")), "invalidDateTimeFormat");
      assertFailure(createFormElement(dataType, mandatory).validate(Date.parse("foo")), "invalidDateTimeFormat");
      assertFailure(createFormElement(dataType, mandatory).validate(new Date("2020-01-01 00:00")), "timeValueValidation");
    });

    it("should return success false if passed empty or null value on mandatory element", () => {
      const mandatory = true;
      assertFailure(createFormElement(dataType, mandatory).validate(""), "emptyValidationMessage");
      assertFailure(createFormElement(dataType, mandatory).validate(null), "emptyValidationMessage");
    });

    it("should return success true if passed valid value on non mandatory element", () => {
      const mandatory = false;
      assertSuccess(createFormElement(dataType, mandatory).validate(new Date("2020-02-29 12:00")));
      assertSuccess(createFormElement(dataType, mandatory).validate(new Date("2020-02-29 23:59")));
    });

    it("should return success false if passed invalid value on non mandatory element", () => {
      const mandatory = false;
      assertFailure(createFormElement(dataType, mandatory).validate(new Date("2020-01-01 24:52")), "invalidDateTimeFormat");
      assertFailure(createFormElement(dataType, mandatory).validate(new Date("2020-01-01 12:95")), "invalidDateTimeFormat");
      assertFailure(createFormElement(dataType, mandatory).validate(new Date("2020-25-30 01:53")), "invalidDateTimeFormat");
      assertFailure(createFormElement(dataType, mandatory).validate(Date.parse("foo")), "invalidDateTimeFormat");
      assertFailure(createFormElement(dataType, mandatory).validate(new Date("2020-01-01 00:00")), "timeValueValidation");
    });

    it("should return success true if passed empty or null on non mandatory element", () => {
      const mandatory = false;
      assertSuccess(createFormElement(dataType, mandatory).validate(null));
    });
  });

  describe("FormElement.validate Time Concept", () => {
    let dataType = Concept.dataType.Time;

    it("should return success true if passed valid value on mandatory element", () => {
      const mandatory = true;
      assertSuccess(createFormElement(dataType, mandatory).validate("23:59"));
      assertSuccess(createFormElement(dataType, mandatory).validate("0:00"));
    });

    it("should return success false if passed invalid value on mandatory element", () => {
      const mandatory = true;
      assertFailure(createFormElement(dataType,  mandatory).validate("24:20"), "invalidTimeFormat");
      assertFailure(createFormElement(dataType, mandatory).validate("28:00"), "invalidTimeFormat");
    });

    it("should return success false if passed empty or null value on mandatory element", () => {
      const mandatory = true;
      assertFailure(createFormElement(dataType, mandatory).validate(""), "emptyValidationMessage");
      assertFailure(createFormElement(dataType, mandatory).validate(null), "emptyValidationMessage");
      assertFailure(createFormElement(dataType, mandatory).validate(undefined), "emptyValidationMessage");
    });

    it("should return success true if passed valid value on non mandatory element", () => {
      const mandatory = false;
      assertSuccess(createFormElement(dataType, mandatory).validate("23:59"));
      assertSuccess(createFormElement(dataType, mandatory).validate("0:00"));
    });

    it("should return success false if passed invalid value on non mandatory element", () => {
      const mandatory = false;
      assertFailure(createFormElement(dataType,  mandatory).validate("24:20"), "invalidTimeFormat");
      assertFailure(createFormElement(dataType, mandatory).validate("28:00"), "invalidTimeFormat");
    });

    it("should return success true if passed empty or null value on non mandatory element", () => {
      const mandatory = false;
      assertSuccess(createFormElement(dataType, mandatory).validate(null));
      assertSuccess(createFormElement(dataType, mandatory).validate(undefined));
    });
  });

  describe("FormElement.validate Text Concept", () => {
    let dataType = Concept.dataType.Text;

    it("should return success true if passed valid value on mandatory element", () => {
      const mandatory = true;
      assertSuccess(createTextFormElement(mandatory, "^\\d{10}$", "Require 10 digits").validate("9919999199"));
    });

    it("should return success false if passed invalid value on mandatory element", () => {
      const mandatory = true;
      assertFailure(createTextFormElement(mandatory, "^\\d{10}$", "Require 10 digits").validate("991999919"), "Require 10 digits");
    });

    it("should return success false if passed empty or null value on mandatory element", () => {
      const mandatory = true;
      assertFailure(createTextFormElement(mandatory, "^\\d{10}$", "Require 10 digits").validate(""), "emptyValidationMessage");
      assertFailure(createTextFormElement(mandatory, "^\\d{10}$", "Require 10 digits").validate(null), "emptyValidationMessage");
      assertFailure(createTextFormElement(mandatory, "^\\d{10}$", "Require 10 digits").validate(undefined), "emptyValidationMessage");
    });

    it("should return success true if passed valid value on non mandatory element", () => {
      const mandatory = true;
      assertSuccess(createTextFormElement(mandatory, "^\\d{10}$", "Require 10 digits").validate("9919999199"));
    });

    it("should return success false if passed invalid value on non mandatory element", () => {
      const mandatory = true;
      assertFailure(createTextFormElement(mandatory, "^\\d{10}$", "Require 10 digits").validate("991999919"), "Require 10 digits");
    });

    it("should return success true if passed empty or null value on non mandatory element", () => {
      const mandatory = false;
      assertSuccess(createTextFormElement(mandatory, "^\\d{10}$", "Require 10 digits").validate(""));
      assertSuccess(createTextFormElement(mandatory, "^\\d{10}$", "Require 10 digits").validate(null));
      assertSuccess(createTextFormElement(mandatory, "^\\d{10}$", "Require 10 digits").validate(undefined));
    });
  });

});
