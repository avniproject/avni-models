import _ from "lodash";
import BaseEntity from "../BaseEntity";

class NestedReportCardResult extends BaseEntity {
    // transient state
    clickable;
    hasErrorMsg;

    static schema = {
        name: "NestedReportCardResult",
        embedded: true,
        properties: {
            uuid: "string",
            dashboard: "string",
            reportCard: "string",
            primaryValue: "string",
            secondaryValue: "string",
            itemKey: "string",
            cardName: "string",
            cardColor: "string",
            textColor: "string",
            reportCardUUID: "string"
        }
    }

    constructor(that) {
        super(that);
    }

    static create(primaryValue, secondaryValue, clickable, hasErrorMsg, itemKey) {
        const nestedReportCardResult = new NestedReportCardResult();
        nestedReportCardResult.uuid = BaseEntity.randomUUID();
        nestedReportCardResult.primaryValue = _.toString(primaryValue);
        nestedReportCardResult.secondaryValue = _.toString(secondaryValue);
        nestedReportCardResult.clickable = clickable;
        nestedReportCardResult.hasErrorMsg = hasErrorMsg;
        nestedReportCardResult.itemKey = itemKey;
        return nestedReportCardResult;
    }

    get dashboard() {
        return this.that.dashboard;
    }

    set dashboard(x) {
        this.that.dashboard = x;
    }

    get reportCard() {
        return this.that.reportCard;
    }

    set reportCard(x) {
        this.that.reportCard = x;
    }

    get primaryValue() {
        return this.that.primaryValue;
    }

    set primaryValue(x) {
        this.that.primaryValue = x;
    }

    get secondaryValue() {
        return this.that.secondaryValue;
    }

    set secondaryValue(x) {
        this.that.secondaryValue = x;
    }

    get itemKey() {
        return this.that.itemKey;
    }

    set itemKey(x) {
        this.that.itemKey = x;
    }

    get cardName() {
        return this.that.cardName;
    }

    set cardName(x) {
        this.that.cardName = x;
    }

    get cardColor() {
        return this.that.cardColor;
    }

    set cardColor(x) {
        this.that.cardColor = x;
    }

    get textColor() {
        return this.that.textColor;
    }

    set textColor(x) {
        this.that.textColor = x;
    }

    get reportCardUUID() {
        return this.that.reportCardUUID;
    }

    set reportCardUUID(x) {
        this.that.reportCardUUID = x;
    }

    static fromQueryResult(ruleResult, reportCard, index) {
        const nestedReportCardResult = NestedReportCardResult.create(ruleResult.primaryValue,
            ruleResult.secondaryValue,
            _.isFunction(ruleResult.lineListFunction),
            ruleResult.hasErrorMsg,
            reportCard.getCardId(index));

        if (ruleResult.hasErrorMsg) {
            return nestedReportCardResult;
        }

        nestedReportCardResult.cardName = ruleResult.cardName;
        nestedReportCardResult.cardColor = _.isNil(ruleResult.cardColor) ? reportCard.colour : ruleResult.cardColor;
        nestedReportCardResult.textColor = ruleResult.textColor;
        nestedReportCardResult.reportCardUUID = reportCard.uuid;
        return nestedReportCardResult;
    }
}

export default NestedReportCardResult;
