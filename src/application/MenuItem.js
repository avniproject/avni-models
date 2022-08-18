import _ from "lodash";

class MenuItem {
  static schema = {
    name: "MenuItem",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      displayKey: "string",
      type: "string",
      icon: {type: "string", optional: true},
      group: "string",
      link: {type: "string", optional: true}
    },
  };
}

export default MenuItem;
