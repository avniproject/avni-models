import _ from 'lodash';
import BaseEntity from "../BaseEntity";
import General from "../utility/General";

class ReportCardResult extends BaseEntity {
    // transient state
    clickable;
    hasErrorMsg;

    static schema = {
        name: "ReportCardResult",
        embedded: true,
        properties: {
            uuid: "string",
            dashboard: "string",
            reportCard: "string",
            primaryValue: "string",
            secondaryValue: "string",
            cardName: {type: "string", optional: true},
            cardColor: {type: "string", optional: true},
            textColor: {type: "string", optional: true},
        }
    }

    constructor(that) {
        super(that);
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

    static create(primaryValue, secondaryValue, clickable, hasErrorMsg = false) {
        const reportCardResult = new ReportCardResult();
        reportCardResult.uuid = General.randomUUID();
        reportCardResult.primaryValue = _.toString(primaryValue);
        reportCardResult.secondaryValue = _.toString(secondaryValue);
        reportCardResult.clickable = clickable;
        reportCardResult.hasErrorMsg = hasErrorMsg;
        return reportCardResult;
    }

    static fromQueryResult(result) {
        const reportCardResult = ReportCardResult.create(result.primaryValue, result.secondaryValue, _.isFunction(result.lineListFunction), result.hasErrorMsg);
        if (!result.hasErrorMsg) {
            reportCardResult.cardName = result.cardName;
            reportCardResult.cardColor = result.cardColor;
            reportCardResult.textColor = result.textColor;
        }
        return reportCardResult;
    }

    get lineListFunction() {
        return _.noop;
    }
}

export default ReportCardResult;
