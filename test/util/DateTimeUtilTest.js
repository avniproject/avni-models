import {DateTimeUtil} from "../../src";
import moment from "moment";
import {assert} from 'chai';

it('should validate date range', function () {
  let now = moment();
  let today = now.toDate();
  let tomorrow = now.clone().add(1, 'd').toDate();
  let yesterday = now.clone().subtract(1, 'd').toDate();
  let [success, message] = DateTimeUtil.validateDateRange(today, today);
  assert.equal(success, true, message);

  [success, message] = DateTimeUtil.validateDateRange(today, tomorrow);
  assert.equal(success, true, message);

  [success,] = DateTimeUtil.validateDateRange(today, yesterday);
  assert.equal(success, false);

  [success,] = DateTimeUtil.validateDateRange(today, null);
  assert.equal(success, false);

  [success, message] = DateTimeUtil.validateDateRange(null, null);
  assert.equal(success, true);
});
