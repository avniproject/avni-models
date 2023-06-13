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

  static validateTimeRange(fromTime, toTime) {
    if (_.isNil(toTime) && _.isNil(fromTime))
      return [true];

    if (_.isNil(toTime) || _.isNil(fromTime))
      return [false, 'bothTimeShouldBeSelectedError'];

    if (!moment(fromTime, 'HH:mm').isSameOrBefore(moment(toTime, 'HH:mm')))
      return [false, 'startTimeGreaterThanEndError'];

    return [true];
  }
}

export default DateTimeUtil;
