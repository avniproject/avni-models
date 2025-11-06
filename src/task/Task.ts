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
import SchemaNames from "../SchemaNames";
import {AuditFields, mapAuditFields} from "../utility/AuditUtil";

class Task extends BaseEntity {
    static schema = {
        name: "Task",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            name: "string",
            taskType: { type: 'object', objectType: 'TaskType' },
            taskStatus: { type: 'object', objectType: 'TaskStatus' },
            scheduledOn: {type: "date"},
            completedOn: {type: "date", optional: true},
            metadata: {type: "list", objectType: "Observation"},
            subject: { type: 'object', objectType: 'Individual', optional: true },
            observations: {type: "list", objectType: "Observation"},
            voided: {type: 'bool', default: false},
            ...AuditFields
        },
    };

    constructor(that = null) {
        super(that);
    }

    get scheduledOn() {
        return this.that.scheduledOn;
    }

    set scheduledOn(x) {
        this.that.scheduledOn = x;
    }

    get completedOn() {
        return this.that.completedOn;
    }

    set completedOn(x) {
        this.that.completedOn = x;
    }

    get metadata() {
        return this.toEntityList("metadata", Observation);
    }

    set metadata(x) {
        this.that.metadata = this.fromEntityList(x);
    }

    get subject() {
        return this.toEntity("subject", Individual);
    }

    set subject(x) {
        this.that.subject = this.fromObject(x);
    }

    get observations() {
        return this.toEntityList("observations", Observation);
    }

    set observations(x) {
        this.that.observations = this.fromEntityList(x);
    }

    get name() {
        return this.that.name;
    }

    set name(x) {
        this.that.name = x;
    }

    get taskType() {
        return this.toEntity("taskType", TaskType);
    }

    set taskType(x) {
        this.that.taskType = this.fromObject(x);
    }

    get taskStatus() {
        return this.toEntity("taskStatus", TaskStatus);
    }

    set taskStatus(x) {
        this.that.taskStatus = this.fromObject(x);
    }

    get createdBy() {
        return this.that.createdBy;
    }

    set createdBy(x) {
        this.that.createdBy = x;
    }

    get lastModifiedBy() {
        return this.that.lastModifiedBy;
    }

    set lastModifiedBy(x) {
        this.that.lastModifiedBy = x;
    }

    get createdByUUID() {
        return this.that.createdByUUID;
    }

    set createdByUUID(x) {
        this.that.createdByUUID = x;
    }

    get lastModifiedByUUID() {
        return this.that.lastModifiedByUUID;
    }

    set lastModifiedByUUID(x) {
        this.that.lastModifiedByUUID = x;
    }

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
        mapAuditFields(task, resource);
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

    getNonMobileNumberMetadataObservationValues() {
        return this.metadata.map(_.identity).filter((o: Observation) => !o.isMobileNumberObs()).map((x: Observation) => x.getReadableValue());
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
