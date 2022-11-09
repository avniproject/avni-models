import _ from "lodash";
import Task from "../../src/task/Task";

class TestTaskFactory {
  static create({uuid, metadata} = {metadata: []}) {
    let task = new Task();
    task.uuid = uuid;
    task.metadata = metadata;
    return task;
  }
}

export default TestTaskFactory;
