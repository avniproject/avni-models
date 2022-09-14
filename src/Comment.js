import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import Individual from "./Individual";
import _ from "lodash";
import ResourceUtil from "./utility/ResourceUtil";
import CommentThread from "./CommentThread";


class Comment extends BaseEntity {

    static schema = {
        name: "Comment",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            text: "string",
            subject: "Individual",
            displayUsername: "string",
            createdByUsername: "string",
            createdDateTime: "date",
            lastModifiedDateTime: "date",
            commentThread: "CommentThread",
            voided: {type: "bool", default: false},
        },
    };

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
