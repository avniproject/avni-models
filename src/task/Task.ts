import {BaseEntity} from "../index";
import TaskType from "./TaskType";
import TaskStatus from "./TaskStatus";
import Observation from "../Observation";
import Individual from "../Individual";
import General from "../utility/General";
import ResourceUtil from "../utility/ResourceUtil";

class Task extends BaseEntity {
    static schema = {
        name: "Task",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            name: "string",
            taskType: "TaskType",
            taskStatus: "TaskStatus",
            scheduledOn: {type: "date"},
            completedOn: {type: "date", optional: true},
            metadata: {type: "list", objectType: "Observation"},
            subject: {type: 'Individual', optional: true},
            observations: {type: "list", objectType: "Observation"},
            voided: {type: 'bool', default: false},
        },
    };

    uuid: string;
    name: string;
    taskType: TaskType;
    taskStatus: TaskStatus;
    scheduledOn: Date;
    completedOn: Date;
    metadata: Observation[];
    subject: Individual;
    observations: Observation[];
    voided: boolean;


    static fromResource(resource, entityService) {
        const task = General.assignFields(
            resource,
            new Task(),
            ['uuid', 'name', 'voided'],
            ['scheduledOn', 'completedOn'],
            ['metadata', 'observations'],
            entityService
        );
        task.taskType = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "taskTypeUUID"),
            TaskType.schema.name
        );
        task.taskStatus = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "taskStatusUUID"),
            TaskStatus.schema.name
        );
        task.subject = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "subjectUUID"),
            Individual.schema.name
        );
        return task;
    }
}

export default Task;
