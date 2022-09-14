import TaskType from "./TaskType";
import General from "../utility/General";
import ResourceUtil from "../utility/ResourceUtil";
import BaseEntity from "../BaseEntity";

class TaskStatus extends BaseEntity {

    static schema = {
        name: "TaskStatus",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            name: "string",
            isTerminal: {type: 'bool', default: false},
            taskType: "TaskType",
            voided: {type: 'bool', default: false},
        },
    };

    uuid: string;
    name: string;
    isTerminal: boolean;
    taskType: TaskType;
    voided: boolean;

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
        taskStatus.taskType = entityService.findEntity(
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
