class ParseUtil {

  static parse(jsonValue) {
    const iso8061 = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;

    return JSON.parse(jsonValue, function (key, value) {
      if (typeof value != 'string') {
        return value;
      }

      if (iso8061 && value.match(iso8061)) {
        return new Date(value);
      }

      return value;
    });
  };
}

export default ParseUtil;