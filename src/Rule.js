import ReferenceEntity from "./ReferenceEntity";
import General from "./utility/General";

class Rule extends ReferenceEntity {
  static schema = {
    name: "Rule",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      _entityString: "string",
      type: "string",
      name: "string",
      fnName: "string",
      executionOrder: "double",
      voided: {type: "bool", default: false},
      data: {type: "string", optional: true},
    },
  };

  constructor(that = null) {
    super(that);
  }

  get _entityString() {
    return this.that._entityString;
  }

  set _entityString(x) {
    this.that._entityString = x;
  }

  get type() {
    return this.that.type;
  }

  set type(x) {
    this.that.type = x;
  }

  get name() {
    return this.that.name;
  }

  set name(x) {
    this.that.name = x;
  }

  get fnName() {
    return this.that.fnName;
  }

  set fnName(x) {
    this.that.fnName = x;
  }

  get executionOrder() {
    return this.that.executionOrder;
  }

  set executionOrder(x) {
    this.that.executionOrder = x;
  }

  get data() {
    return this.that.data;
  }

  set data(x) {
    this.that.data = x;
  }

  static types = {
    Decision: "Decision",
    VisitSchedule: "VisitSchedule",
    ViewFilter: "ViewFilter",
    Checklists: "Checklists",
    Validation: "Validation",
    EnrolmentSummary: "EnrolmentSummary",
  };

  static fromResource(resource, entityService) {
    const rule = General.assignFields(resource, new Rule(), [
      "uuid",
      "name",
      "type",
      "fnName",
      "executionOrder",
      "entity",
    ]);
    rule.data = JSON.stringify(resource["data"]);
    rule.voided = !!resource.voided;
    return rule;
  }

  get entity() {
    return JSON.parse(this._entityString || "{}");
  }

  set entity(entityJson) {
    this._entityString = JSON.stringify(entityJson || {});
  }

  clone() {
    return super.clone(new Rule());
  }
}

export default Rule;
