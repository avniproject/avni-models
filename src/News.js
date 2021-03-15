import BaseEntity from "./BaseEntity";
import General from "./utility/General";


class News extends BaseEntity {

    static schema = {
        name: "News",
        primaryKey: "uuid",
        properties: {
            uuid: "string",
            title: "string",
            publishedDate: "date",
            heroImage: {type: "string", optional: true},
            content: {type: "string", optional: true},
            contentHtml: {type: "string", optional: true},
            voided: {type: "bool", default: false},
        }
    };

    static fromResource(resource) {
        return General.assignFields(
            resource,
            new News(),
            ["uuid", "title", "heroImage", "content", "contentHtml", "voided"],
            ["publishedDate"]
        );
    }

}

export default News
