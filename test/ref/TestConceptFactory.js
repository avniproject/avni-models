import {Concept} from "../../src";

class TestConceptFactory {
  static create({uuid, dataType}) {
    const concept = new Concept();
    concept.uuid = uuid;
    concept.datatype = dataType;
    return concept;
  }
}

export default TestConceptFactory;
