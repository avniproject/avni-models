import General from "./utility/General";
import StringKeyNumericValue from "./application/StringKeyNumericValue";
import moment from "moment";
import PersistedObject from "./PersistedObject";
import SchemaNames from "./SchemaNames";

class ChecklistItemStatus extends PersistedObject {
  static schema = {
    name: SchemaNames.ChecklistItemStatus,
    embedded: true,
    properties: {
      state: "string",
      from: SchemaNames.StringKeyNumericValue,
      to: SchemaNames.StringKeyNumericValue,
      color: { type: "string", default: "yellow" },
      displayOrder: "double",
      start: "int",
      end: "int",
    },
  };

  constructor(that = null) {
    super(that);
  }

  get state() {
      return this.that.state;
  }

  set state(x) {
      this.that.state = x;
  }

  get from() {
      return this.toEntity("from", StringKeyNumericValue);
  }

  set from(x) {
      this.that.from = this.fromObject(x);
  }

  get to() {
      return this.toEntity("to", StringKeyNumericValue);
  }

  set to(x) {
      this.that.to = this.fromObject(x);
  }

  get color() {
      return this.that.color;
  }

  set color(x) {
      this.that.color = x;
  }

  get displayOrder() {
      return this.that.displayOrder;
  }

  set displayOrder(x) {
      this.that.displayOrder = x;
  }

  get start() {
      return this.that.start;
  }

  set start(x) {
      this.that.start = x;
  }

  get end() {
      return this.that.end;
  }

  set end(x) {
      this.that.end = x;
  }

  static fromResource(resource, entityService) {
    const checklistItemStatus = General.assignFields(resource, new ChecklistItemStatus(), [
      "state",
      "color",
      "displayOrder",
      "start",
      "end",
    ]);
    const [toK, toV] = Object.entries(resource["to"])[0];
    const [fromK, fromV] = Object.entries(resource["from"])[0];
    checklistItemStatus.to = StringKeyNumericValue.fromResource(toK, toV);
    checklistItemStatus.from = StringKeyNumericValue.fromResource(fromK, fromV);
    return checklistItemStatus;
  }

  static get completed() {
    const completed = new ChecklistItemStatus();
    completed.color = "green";
    completed.state = "Completed";
    return completed;
  }

  static get expired() {
    const expired = new ChecklistItemStatus();
    expired.color = "grey";
    expired.state = "Expired";
    return expired;
  }

  static na(years) {
    const na = new ChecklistItemStatus();
    na.to = {};
    na.displayOrder = 999;
    na.to.key = "year";
    na.to.value = years;
    na.from = {};
    na.from.key = "year";
    na.from.value = years;
    na.color = "grey";
    na.state = "Past Expiry";
    return na;
  }

  fromDate(baseDate) {
    return moment(baseDate).add(this.from.value, this.from.key).toDate();
  }
}

export default ChecklistItemStatus;
