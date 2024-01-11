import BaseEntity from "../BaseEntity";
import ResourceUtil from "../utility/ResourceUtil";
import SchemaNames from "../SchemaNames";
import {AuditFields, mapAuditFields} from "../utility/AuditUtil";

class TaskUnAssignment extends BaseEntity {
    static schema = {
        name: SchemaNames.TaskUnAssignment,
        primaryKey: 'uuid',
        properties: {
            uuid: 'string',
            taskUUID: 'string',
            hasMigrated: {type: 'bool', default: false},
            ...AuditFields
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

    static fromResource(resource) {
        const taskUnAssigment = new TaskUnAssignment();
        taskUnAssigment.uuid = resource.uuid;
        taskUnAssigment.taskUUID = ResourceUtil.getUUIDFor(resource, 'taskUUID');
        mapAuditFields(taskUnAssigment, resource);
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
