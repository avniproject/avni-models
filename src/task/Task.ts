import TaskType from "./TaskType";
import TaskStatus from "./TaskStatus";
import Observation from "../Observation";
import Individual from "../Individual";
import General from "../utility/General";
import ResourceUtil from "../utility/ResourceUtil";
import ObservationsHolder from "../ObservationsHolder";
import moment from "moment";
import _ from 'lodash';
import BaseEntity from "../BaseEntity";

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

    get toResource() {
        const taskResource = _.pick(this, ["uuid", "voided", "name"]);
        taskResource.observations = _.map(this.observations, "toResource");
        taskResource.metadata = _.map(this.metadata, "toResource");
        taskResource.taskTypeUUID = this.taskType.uuid;
        taskResource.taskStatusUUID = this.taskStatus.uuid;
        if (!_.isNil(this.scheduledOn))
            taskResource.scheduledOn = moment(this.scheduledOn).format();
        if (!_.isNil(this.completedOn)) {
            taskResource.completedOn = moment(this.completedOn).format();
        }
        if (!_.isNil(this.subject)) {
            taskResource.subjectUUID = this.subject.uuid;
        }
        return taskResource;
    }

    static fromResource(resource, entityService) {
        const task = General.assignFields(
            resource,
            new Task(),
            ['uuid', 'name', 'voided'],
            ['scheduledOn', 'completedOn'],
            ['metadata', 'observations'],
            entityService
        );
        task.taskType = entityService.findEntity(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "taskTypeUUID"),
            TaskType.schema.name
        );
        task.taskStatus = entityService.findEntity(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "taskStatusUUID"),
            TaskStatus.schema.name
        );
        task.subject = entityService.findEntity(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "subjectUUID"),
            Individual.schema.name
        );
        return task;
    }

    setScheduledOn(date) {
        this.scheduledOn = date;
    }

    setCompletedOn(date = new Date()) {
        this.completedOn = date;
    }

    setTaskStatus(newStatus) {
        this.taskStatus = newStatus;
    }

    isCallType() {
        return this.taskType.type === TaskType.TaskTypeName.Call;
    }

    isTaskStatusTerminal() {
        return this.taskStatus.isTerminal;
    }

    isOpenSubjectType() {
        return this.taskType.type === TaskType.TaskTypeName.OpenSubject;
    }

    cloneForEdit() {
        const task = new Task();
        task.uuid = this.uuid;
        task.name = this.name;
        task.taskType = this.taskType.clone();
        task.taskStatus = this.taskStatus.clone();
        task.scheduledOn = this.scheduledOn;
        task.completedOn = this.completedOn;
        task.metadata = ObservationsHolder.clone(this.metadata);
        task.subject = this.subject;
        task.observations = ObservationsHolder.clone(this.observations);
        task.voided = this.voided;
        return task;
    }
}

export default Task;
