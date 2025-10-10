import TaskType from "./TaskType";
import General from "../utility/General";
import ResourceUtil from "../utility/ResourceUtil";
import BaseEntity from "../BaseEntity";
import SchemaNames from "../SchemaNames";

class TaskStatus extends BaseEntity {

    static schema = {
        name: SchemaNames.TaskStatus,
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            name: "string",
            isTerminal: {type: 'bool', default: false},
            taskType: { type: 'object', objectType: 'TaskType' },
            voided: {type: 'bool', default: false},
        },
    };

  constructor(that = null) {
    super(that);
  }

  get name() {
      return this.that.name;
  }

  set name(x) {
      this.that.name = x;
  }

  get isTerminal() {
      return this.that.isTerminal;
  }

  set isTerminal(x) {
      this.that.isTerminal = x;
  }

  get taskType() {
      return this.toEntity("taskType", TaskType);
  }

  set taskType(x) {
      this.that.taskType = this.fromObject(x);
  }

  static fromResource(resource, entityService) {
        const taskStatus = General.assignFields(
            resource,
            new TaskStatus(),
            ['uuid', 'name', 'voided'],
            [],
            [],
            entityService
        );
        taskStatus.isTerminal = resource.terminal;
        taskStatus.taskType = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "taskTypeUUID"),
            TaskType.schema.name
        );
        return taskStatus;
    }

    clone() {
        const taskStatus = new TaskStatus();
        taskStatus.uuid = this.uuid;
        taskStatus.name = this.name;
        taskStatus.isTerminal = this.isTerminal;
        taskStatus.taskType = this.taskType.clone();
        taskStatus.voided = this.voided;
        return taskStatus;
    }

}


export default TaskStatus;
