const ah = {
  remove: function(array, predicate) {
    const result = [];
    if (!(array && array.length)) {
      return result;
    }
    let index = -1,
      indexes = [],
      length = array.length;

    while (++index < length) {
      const value = array[index];
      if (predicate(value, index, array)) {
        result.push(value);
        indexes.push(index);
      }
    }
    this.basePullAt(array, indexes);
    return result;
  },

  basePullAt: function(array, indexes) {
    let length = array ? indexes.length : 0,
      lastIndex = length - 1;

    let previous = null;
    while (length--) {
      const index = indexes[length];
      if (length === lastIndex || index !== previous) {
        previous = index;
        array.splice(index, 1);
      }
    }
    return array;
  }
}

export default ah;
