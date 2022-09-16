import _ from "lodash";
import Concept from "../Concept";
import moment from "moment";
import General from "../utility/General";

class PrimitiveValue {
  constructor(value, datatype) {
    this.value = value;
    this.datatype = datatype;
    this.answer = this._valueFromString();
  }

  asDisplayDate() {
    const format =
      !General.hoursAndMinutesOfDateAreZero(this.answer) &&
      this.datatype === Concept.dataType.DateTime
        ? "DD-MMM-YYYY HH:mm"
        : "DD-MMM-YYYY";
    return moment(this.answer).format(format);
  }

  asDisplayTime() {
    return General.toDisplayTime(this.answer);
  }

  getValue() {
    return this.answer;
  }

  get toResource() {
    return this.answer;
  }

  cloneForEdit() {
    return new PrimitiveValue(this.value, this.datatype);
  }

  _valueFromString() {
    // https://stackoverflow.com/a/1711405/766175
    if (this.datatype === Concept.dataType.Numeric
        && !isNaN(this.value) && !isNaN(parseInt(this.value))) {
        // && !/\.$|\.0+$|\.*0$/.test(this.value)) {
      return _.toNumber(this.value);
    } else if (this.datatype === Concept.dataType.DateTime) {
      return new Date(Date.parse(this.value));
    } else if (this.datatype === Concept.dataType.Date) {
      const date = new Date(Date.parse(this.value));
      return moment(date).startOf("day").toDate();
    }

    return this.value;
  }
}

export default PrimitiveValue;
