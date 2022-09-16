import PersistedObject from "../PersistedObject";

class Point extends PersistedObject {
  static schema = {
    name: "Point",
    properties: {
      x: "double",
      y: "double",
    },
  };

   constructor(that = null) {
    super(that);
  }

  get x() {
      return this.that.x;
  }

  set x(x) {
      this.that.x = x;
  }

  get y() {
      return this.that.y;
  }

  set y(f) {
      this.that.y = f;
  }

  static newInstance(x, y) {
    const point = new Point();
    point.x = x;
    point.y = y;
    return point;
  }

  static fromResource(resource) {
    return Point.newInstance(resource.x, resource.y);
  }

  get toResource() {
    const resource = {};
    resource.x = this.x;
    resource.y = this.y;
    return resource;
  }

  clone() {
    return Point.newInstance(this.x, this.y);
  }
}

export default Point;
