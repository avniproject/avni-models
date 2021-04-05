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
            read: {type: "bool", default: false},
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

    markRead() {
        const news = this.cloneForEdit();
        news.read = true;
        return news;
    }

    cloneForEdit() {
        const news = new News;
        news.uuid = this.uuid;
        news.title = this.title;
        news.publishedDate = this.publishedDate;
        news.heroImage = this.heroImage;
        news.content = this.content;
        news.contentHtml = this.contentHtml;
        news.voided = this.voided;
        news.read = this.read;
        return news;
    }

}

export default News
