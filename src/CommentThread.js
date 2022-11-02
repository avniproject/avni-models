import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import _ from "lodash";

class CommentThread extends BaseEntity {
    static schema = {
        name: "CommentThread",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            status: "string",
            openDateTime: "date",
            resolvedDateTime: {type: "date", optional: true},
            voided: {type: "bool", default: false},
        },
    };

    constructor(that = null) {
        super(that);
    }

    get status() {
        return this.that.status;
    }

    set status(x) {
        this.that.status = x;
    }

    get openDateTime() {
        return this.that.openDateTime;
    }

    set openDateTime(x) {
        this.that.openDateTime = x;
    }

    get resolvedDateTime() {
        return this.that.resolvedDateTime;
    }

    set resolvedDateTime(x) {
        this.that.resolvedDateTime = x;
    }

    static threadStatus = {
        Open: "Open",
        Resolved: "Resolved",
    };

    get toResource() {
        const resource = _.pick(this, [
            "uuid",
            "status",
            "voided"
        ]);
        resource.openDateTime = General.isoFormat(this.openDateTime);
        resource.resolvedDateTime = General.isoFormat(this.resolvedDateTime);
        return resource;
    }

    static fromResource(resource) {
        return General.assignFields(resource, new CommentThread(),
            ["uuid", "status", "voided"]
            , ["openDateTime", "resolvedDateTime"]);
    }

    static createEmptyInstance(uuid) {
        const commentThread = new CommentThread();
        commentThread.uuid = uuid || General.randomUUID();
        commentThread.status = "";
        commentThread.openDateTime = new Date();
        return commentThread;
    }

    cloneForEdit() {
        const commentThread = new CommentThread();
        commentThread.uuid = this.uuid;
        commentThread.status = this.status;
        commentThread.openDateTime = this.openDateTime;
        commentThread.resolvedDateTime = this.resolvedDateTime;
        commentThread.voided = this.voided;
        return commentThread;
    }

    markResolved() {
        const commentThread = this.cloneForEdit();
        commentThread.status = CommentThread.threadStatus.Resolved;
        commentThread.resolvedDateTime = new Date();
        return commentThread;
    }

    openThread() {
        const commentThread = this.cloneForEdit();
        commentThread.status = CommentThread.threadStatus.Open;
        commentThread.resolvedDateTime = null;
        return commentThread;
    }

    isResolved() {
        return this.status === CommentThread.threadStatus.Resolved;
    }
}

export default CommentThread;
