import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import Individual from "./Individual";
import _ from "lodash";
import ResourceUtil from "./utility/ResourceUtil";
import CommentThread from "./CommentThread";
import SchemaNames from "./SchemaNames";
import {AuditFields, mapAuditFields} from "./utility/AuditUtil";

class Comment extends BaseEntity {
    static schema = {
        name: SchemaNames.Comment,
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            text: "string",
            subject: { type: 'object', objectType: 'Individual' },
            displayUsername: "string",
            createdByUsername: "string",
            createdDateTime: "date",
            lastModifiedDateTime: "date",
            commentThread: { type: 'object', objectType: 'CommentThread' },
            voided: {type: "bool", default: false},
            ...AuditFields
        },
    };

    constructor(that = null) {
        super(that);
    }

    get text() {
        return this.that.text;
    }

    set text(x) {
        this.that.text = x;
    }

    get subject() {
        return this.toEntity("subject", Individual);
    }

    set subject(x) {
        this.that.subject = this.fromObject(x);
    }

    get displayUsername() {
        return this.that.displayUsername;
    }

    set displayUsername(x) {
        this.that.displayUsername = x;
    }

    get createdByUsername() {
        return this.that.createdByUsername;
    }

    set createdByUsername(x) {
        this.that.createdByUsername = x;
    }

    get createdDateTime() {
        return this.that.createdDateTime;
    }

    set createdDateTime(x) {
        this.that.createdDateTime = x;
    }

    get lastModifiedDateTime() {
        return this.that.lastModifiedDateTime;
    }

    set lastModifiedDateTime(x) {
        this.that.lastModifiedDateTime = x;
    }

    get commentThread() {
        return this.toEntity("commentThread", CommentThread);
    }

    set commentThread(x) {
        this.that.commentThread = this.fromObject(x);
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
        const resource = _.pick(this, [
            "uuid",
            "text",
            "voided"
        ]);
        resource["subjectUUID"] = this.subject.uuid;
        resource["commentThreadUUID"] = this.commentThread.uuid;
        return resource;
    }

    static fromResource(resource, entityService) {
        const comment = General.assignFields(resource, new Comment(),
            ["uuid", "text", "displayUsername", "voided"]
            , ["createdDateTime", "lastModifiedDateTime"]);
        comment.createdByUsername = resource["createdBy"];
        comment.subject = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "individualUUID"),
            Individual.schema.name
        );
        comment.commentThread = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "commentThreadUUID"),
            CommentThread.schema.name
        );
        mapAuditFields(comment, resource);
        return comment;
    }

    static createEmptyInstance(uuid) {
        const comment = new Comment();
        comment.uuid = uuid || General.randomUUID();
        comment.text = "";
        comment.displayUsername = "";
        comment.createdByUsername = "";
        comment.subject = Individual.createEmptyInstance();
        comment.commentThread = CommentThread.createEmptyInstance();
        return comment;
    }

    editComment(text) {
        const comment = this.cloneForEdit();
        comment.text = text;
        return comment;
    }

    isEmpty() {
        return _.isEmpty(this.text);
    }

    cloneForEdit() {
        const comment = new Comment();
        comment.uuid = this.uuid;
        comment.text = this.text;
        comment.subject = this.subject;
        comment.displayUsername = this.displayUsername;
        comment.createdByUsername = this.createdByUsername;
        comment.createdDateTime = this.createdDateTime;
        comment.lastModifiedDateTime = this.lastModifiedDateTime;
        comment.commentThread = this.commentThread.cloneForEdit();
        comment.voided = this.voided;
        return comment;
    }

    toJSON() {
        return {
            uuid: this.uuid,
            text: this.text,
            subject: this.subject,
            displayUsername: this.displayUsername,
            createdByUsername: this.createdByUsername,
            createdDateTime: this.createdDateTime,
            lastModifiedDateTime: this.lastModifiedDateTime,
            voided: this.voided,
        };
    }
}

export default Comment
