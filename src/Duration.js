import _ from "lodash";
import moment from "moment";

class Duration {
    constructor(durationValue, durationUnit) {
        this._durationValue = durationValue;
        this.durationUnit = durationUnit;
    }

    static inDay(value) {
        return new Duration(value, Duration.Day);
    }

    static inWeek(value) {
        return new Duration(value, Duration.Week);
    }

    static Hour = "hours";
    static Minute = "minutes";
    static Day = "days";
    static Week = "weeks";
    static Month = "months";
    static Year = "years";

    static inMonth(value) {
        return new Duration(value, Duration.Month);
    }

    static inYear(value) {
        return new Duration(value, Duration.Year);
    }

    static durationBetween(dateA, dateB) {
        const diff = moment(dateB).diff(dateA, "months", true);
        if (diff >= 1) {
            return new Duration(Math.round(diff * 2) / 2, Duration.Month); // round to nearest .5
        } else {
            return new Duration(moment(dateB).diff(dateA, "days"), Duration.Day);
        }
    }

    get isInYears() {
        return this.durationUnit === Duration.Year;
    }

    get durationValueAsString() {
        return _.toString(this._durationValue);
    }

    get durationValue() {
        return this._durationValue;
    }

    toString(i18n) {
        const durationUnitText =
            this._durationValue <= 1
                ? this.durationUnit.substring(0, this.durationUnit.length - 1)
                : this.durationUnit;
        return i18n
            ? `${this.durationValueAsString} ${i18n.t(durationUnitText.toLowerCase())}`
            : `${this.durationValueAsString} ${this.durationUnit}`;
    }

    getValue() {
        return {value: this.durationValue, unit: this.durationUnit};
    }

    toUnicodeString(i18n) {
        return this.toString(i18n).replace(".5", "\u00BD");
    }

    get isEmpty() {
        return _.isNil(this._durationValue) || _.isEmpty(this._durationValue);
    }

    get inYears() {
        if (this.durationUnit === Duration.Month) return this.durationValue / 12;
        else return this.durationValue;
    }

    changeUnit(durationUnit) {
        return new Duration(this.durationValue, durationUnit);
    }

    changeValue(value) {
        return new Duration(value.replace(/[^0-9]/g, ""), this.durationUnit);
    }

    static fromDataEntryDate(durationUnit, date, dataEntryDate) {
        const durationValue = moment(dataEntryDate).diff(date, durationUnit);
        return new Duration(durationValue, durationUnit);
    }

    cloneForEdit() {
        return new Duration(this.durationValue, this.durationUnit);
    }

    dateInPastBasedOnToday(asPerDate) {
        return moment(asPerDate).subtract(this.durationValue, this.durationUnit).toDate();
    }

    get toResource() {
        return `P${this.toISO}`;
    }

    get toISO() {
        const timeDurationUnits = ["hours", "minutes", "seconds"];
        const isoDuration = `${this._durationValue || 0}${isoMap[this.durationUnit]}`;
        return _.includes(timeDurationUnits, this.durationUnit) ? `T${isoDuration}` : isoDuration;
    }

    static fromObs(obs) {
        if (typeof obs === "string") {
            return _.head(Duration.fromIsoObs(obs));
        }
        return new Duration(obs._durationValue, obs.durationUnit);
    }

    static fromIsoObs(obs) {
        const iso8601DurationRegex = /(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?T{0,1}(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?/;
        const matches = obs.match(iso8601DurationRegex);
        return [
            {unit: "years", value: matches[2]},
            {unit: "months", value: matches[3]},
            {unit: "weeks", value: matches[4]},
            {unit: "days", value: matches[5]},
            {unit: "hours", value: matches[6]},
            {unit: "minutes", value: matches[7]},
            {unit: "seconds", value: matches[8]},
        ]
            .filter((v) => !_.isEmpty(v.value))
            .map((opt) => new Duration(opt.value, opt.unit));
    }
}

const isoMap = {
    years: "Y",
    months: "M",
    weeks: "W",
    days: "D",
    hours: "H",
    minutes: "M",
    seconds: "S",
};

export default Duration;
