import _ from "lodash";

class ResourceUtil {
  static getUUIDFor(resource, property) {
    return ResourceUtil.getFieldValue(resource, property);
  }

  static getFieldValue(resource, property) {
    return _.get(resource, ["_links", property, "href"]);
  }
}

export default ResourceUtil;
