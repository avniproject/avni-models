import _ from "lodash";
import moment from "moment";

class DateTimeUtil {
  static validateDateRange(fromDate, toDate) {
    if (_.isNil(toDate) && _.isNil(fromDate))
      return [true];

    if (_.isNil(toDate) || _.isNil(fromDate))
      return [false, 'bothDateShouldBeSelectedError'];

    if (!moment(fromDate).isSameOrBefore(toDate))
       return [false, 'startDateGreaterThanEndError'];

    return [true];
  }
}

export default DateTimeUtil;
