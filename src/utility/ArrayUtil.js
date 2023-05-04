import _ from "lodash";

class ArrayUtil {
  static toggle(list, toggledItem, iteratee) {
    if (_.remove(list, (x) => iteratee(x, toggledItem)).length !== 1)
      list.push(toggledItem);
  }
}

export default ArrayUtil;
