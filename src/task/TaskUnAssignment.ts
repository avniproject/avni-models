import BaseEntity from "../BaseEntity";
import ResourceUtil from "../utility/ResourceUtil";

class TaskUnAssignment extends BaseEntity {
    static schema = {
        name: 'TaskUnAssignment',
        primaryKey: 'uuid',
        properties: {
            uuid: 'string',
            taskUUID: 'string',
            hasMigrated: {type: 'bool', default: false},
        }
    };

  constructor(that = null) {
    super(that);
  }

  get taskUUID() {
      return this.that.taskUUID;
  }

  set taskUUID(x) {
      this.that.taskUUID = x;
  }

  get hasMigrated() {
      return this.that.hasMigrated;
  }

  set hasMigrated(x) {
      this.that.hasMigrated = x;
  }

  static fromResource(resource) {
        const taskUnAssigment = new TaskUnAssignment();
        taskUnAssigment.uuid = resource.uuid;
        taskUnAssigment.taskUUID = ResourceUtil.getUUIDFor(resource, 'taskUUID');
        return taskUnAssigment;
    }

    updatedHasMigrated() {
        const taskUnAssigment = this.clone();
        taskUnAssigment.hasMigrated = true;
        return taskUnAssigment;
    }

    clone() {
        const taskUnAssigment = new TaskUnAssignment();
        taskUnAssigment.uuid = this.uuid;
        taskUnAssigment.taskUUID = this.taskUUID;
        taskUnAssigment.hasMigrated = this.hasMigrated;
        return taskUnAssigment;
    }
}

export default TaskUnAssignment;
