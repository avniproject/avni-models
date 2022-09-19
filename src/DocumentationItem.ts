import BaseEntity from "./BaseEntity";
import ResourceUtil from "./utility/ResourceUtil";
import Documentation from "./Documentation";

class DocumentationItem extends BaseEntity {
    static schema = {
        name: 'DocumentationItem',
        primaryKey: 'uuid',
        properties: {
            uuid: 'string',
            content: {type: "string", optional: true},
            language: {type: "string", optional: true},
            contentHtml: {type: "string", optional: true},
            documentation: {type: 'Documentation'},
            voided: {type: "bool", default: false},
        }
    };

   constructor(that = null) {
    super(that);
  }

  get content() {
      return this.that.content;
  }

  set content(x) {
      this.that.content = x;
  }

  get language() {
      return this.that.language;
  }

  set language(x) {
      this.that.language = x;
  }

  get contentHtml() {
      return this.that.contentHtml;
  }

  set contentHtml(x) {
      this.that.contentHtml = x;
  }

  get documentation() {
      return this.toEntity("documentation", Documentation);
  }

  set documentation(x) {
      this.that.documentation = x && x.that;
  }

  static fromResource(resource, entityService) {
        const documentationItem = new DocumentationItem();
        documentationItem.uuid = resource.uuid;
        documentationItem.content = resource.content;
        documentationItem.contentHtml = resource.contentHtml;
        documentationItem.language = resource.language;
        documentationItem.voided = resource.voided;
        documentationItem.documentation = entityService.findByKey(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "documentationUUID"),
            Documentation.schema.name
        );
        return documentationItem;
    }
}


export default DocumentationItem;
