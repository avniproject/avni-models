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

    uuid: string;
    taskUUID: string;
    hasMigrated: boolean;

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
