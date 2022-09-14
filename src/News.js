import BaseEntity from "./BaseEntity";
import General from "./utility/General";
import moment from "moment";


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
            lastModifiedDateTime: "date",
        }
    };

    static fromResource(resource, entityService) {
        const news = General.assignFields(
            resource,
            new News(),
            ["uuid", "title", "heroImage", "content", "contentHtml", "voided"],
            ["publishedDate", "lastModifiedDateTime"]
        );
        const olderNews = entityService.findByKey(
            "uuid",
            news.uuid,
            News.schema.name
        );
        if (olderNews && moment(news.lastModifiedDateTime).isAfter(olderNews.lastModifiedDateTime)) {
            news.read = false;
        }
        return news;
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
