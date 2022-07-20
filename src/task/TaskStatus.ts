import {BaseEntity} from "../index";
import TaskType from "./TaskType";
import General from "../utility/General";
import ResourceUtil from "../utility/ResourceUtil";

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
            ['uuid', 'name', 'voided', 'isTerminal'],
            [],
            [],
            entityService
        );
        taskStatus.taskType = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "taskTypeUUID"),
            TaskType.schema.name
        );
        return taskStatus;
    }

}


export default TaskStatus;
