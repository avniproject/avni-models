import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import ResourceUtil from "./utility/ResourceUtil";
import StandardReportCardType from "./StandardReportCardType";

class ReportCard extends BaseEntity {

  static schema = {
    name: "ReportCard",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      name: "string",
      query: {type: "string", optional: true},
      description: {type: "string", optional: true},
      standardReportCardType: {type: "StandardReportCardType", option: true},
      colour: "string",
      voided: {type: "bool", default: false},
    },
  };

  constructor(that = null) {
    super(that);
  }

  get name() {
    return this.that.name;
  }

  set name(x) {
    this.that.name = x;
  }

  get query() {
    return this.that.query;
  }

  set query(x) {
    this.that.query = x;
  }

  get description() {
    return this.that.description;
  }

  set description(x) {
    this.that.description = x;
  }

  get standardReportCardType() {
    return this.toEntity("standardReportCardType", StandardReportCardType);
  }

  set standardReportCardType(x) {
    this.that.standardReportCardType = this.fromObject(x);
  }

  get colour() {
    return this.that.colour;
  }

  set colour(x) {
    this.that.colour = x;
  }

  get iconName() {
    //TODO: right now not syncing the icon name uploaded from app designer.
    return _.isNil(this.standardReportCardType) ? null : this.standardReportCardType.iconName;
  }

  get cardColor() {
    return _.isNil(this.standardReportCardType) ? this.colour : this.standardReportCardType.cardColor;
  }

  get textColor() {
    return _.isNil(this.standardReportCardType) ? '#ffffff' : this.standardReportCardType.textColor;
  }

  static fromResource(resource, entityService) {
    const reportCard = General.assignFields(resource, new ReportCard(),
      ["uuid", "name", "query", "description", "colour", "voided"]);
    reportCard.standardReportCardType = entityService.findByKey(
      "uuid",
      ResourceUtil.getUUIDFor(resource, "standardReportCardUUID"),
      StandardReportCardType.schema.name
    );
    return reportCard;
  }

    isStandardTaskType() {
      return _.isNil(this.standardReportCardType) ? false : this.standardReportCardType.isTaskType();
    }
}

export default ReportCard;
