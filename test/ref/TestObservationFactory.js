import {Observation} from "../../src";

class TestObservationFactory {
  static create({concept, valueJSON} = {valueJSON: "{}"}) {
    const observation = new Observation();
    observation.concept = concept;
    observation.valueJSON = valueJSON;
    return observation;
  }
}

export default TestObservationFactory;
