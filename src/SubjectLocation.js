import PersistedObject from "./PersistedObject";
import Point from "./geo/Point";

class SubjectLocation extends PersistedObject {
  static schema = {
    name: "SubjectLocation",
    properties: {
      coordinates: { type: 'object', objectType: 'Point', optional: true },
      accuracy: {type: "double", optional: true},
    },
  };

   constructor(that = null) {
    super(that);
  }

  get coordinates() {
      return this.toEntity("coordinates", Point);
  }

  set coordinates(x) {
      this.that.coordinates = this.fromObject(x);
  }

  get accuracy() {
      return this.that.accuracy;
  }

  set accuracy(accuracy) {
      this.that.accuracy = accuracy;
  }

  // Convenience methods for latitude/longitude access
  get latitude() {
      return this.coordinates ? this.coordinates.y : null;
  }

  get longitude() {
      return this.coordinates ? this.coordinates.x : null;
  }

  static newInstance(position, accuracy) {
    const subjectLocation = new SubjectLocation();
    subjectLocation.coordinates = position;
    subjectLocation.accuracy = accuracy;
    return subjectLocation;
  }

  static fromResource(resource) {
    const subjectLocation = new SubjectLocation();
    if (resource.coordinates) {
      subjectLocation.coordinates = Point.fromResource(resource.coordinates);
    }
    subjectLocation.accuracy = resource.accuracy;
    return subjectLocation;
  }

  get toResource() {
    const resource = {};
    if (this.coordinates) {
      resource.coordinates = this.coordinates.toResource;
    }
    resource.accuracy = this.accuracy;
    return resource;
  }

  clone() {
    const cloned = new SubjectLocation();
    if (this.coordinates) {
      cloned.coordinates = this.coordinates.clone();
    }
    cloned.accuracy = this.accuracy;
    return cloned;
  }
}

export default SubjectLocation;
