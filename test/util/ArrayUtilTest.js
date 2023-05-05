import {assert} from 'chai';
import ArrayUtil from "../../src/utility/ArrayUtil";

it('should toggle an item from the list', function () {
  let list = [1, 3, 4];
  ArrayUtil.toggle(list, 1, (a, b) => a === b);
  assert.equal(2, list.length);

  list = [1, 3, 4];
  ArrayUtil.toggle(list, 5, (a, b) => a === b);
  assert.equal(4, list.length);
});
