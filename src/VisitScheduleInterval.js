import ReferenceEntity from "./ReferenceEntity";
import Program from "./Program";
import _ from "lodash";
import StringKeyNumericValue from "./application/StringKeyNumericValue";
import VisitScheduleConfig from "./VisitScheduleConfig";
import General from "./utility/General";

class VisitScheduleInterval extends ReferenceEntity {
  static schema = {
    name: "VisitScheduleInterval",
    properties: {
      from: "string",
      min: "StringKeyNumericValue",
      max: "StringKeyNumericValue",
    },
  };

   constructor(that = null) {
    super(that);
  }

  get from() {
      return this.that.from;
  }

  set from(x) {
      this.that.from = x;
  }

  get min() {
      return this.toEntity("min", StringKeyNumericValue);
  }

  set min(x) {
      this.that.min = x && x.that;
  }

  get max() {
      return this.toEntity("max", StringKeyNumericValue);
  }

  set max(x) {
      this.that.max = x && x.that;
  }

  static fromResource(resource) {
    const visitScheduleInterval = General.assignFields(resource, new VisitScheduleInterval(), [
      "uuid",
      "from",
    ]);
    visitScheduleInterval.min = StringKeyNumericValue.fromResource(
      resource.min.unit,
      resource.min.value
    );
    visitScheduleInterval.max = StringKeyNumericValue.fromResource(
      resource.max.unit,
      resource.max.value
    );
    return visitScheduleInterval;
  }

  clone() {
    return super.clone(new VisitScheduleInterval());
  }
}

export default VisitScheduleInterval;
