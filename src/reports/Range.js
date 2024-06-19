import _ from "lodash";

class Range {
    static DateRange = "DateRange";

    minValue;
    maxValue;

    constructor(minValue, maxValue) {
        this.minValue = minValue;
        this.maxValue = maxValue;
    }

    static empty() {
        return new Range(null, null);
    }

    isEmpty() {
        return _.isNil(this.minValue) || _.isNil(this.maxValue);
    }
}

export default Range;
