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

    uuid: string;
    content: string;
    contentHtml: string;
    language: string;
    documentation: Documentation;
    voided: boolean;

    static fromResource(resource, entityService) {
        const documentationItem = new DocumentationItem();
        documentationItem.uuid = resource.uuid;
        documentationItem.content = resource.content;
        documentationItem.contentHtml = resource.contentHtml;
        documentationItem.language = resource.language;
        documentationItem.voided = resource.voided;
        documentationItem.documentation = entityService.findEntity(
            "uuid",
            ResourceUtil.getUUIDFor(resource, "documentationUUID"),
            Documentation.schema.name
        );
        return documentationItem;
    }

  mapNonPrimitives(realmObject, entityMapper) {
    this.documentation = entityMapper.toEntity(realmObject.documentation, Documentation);
  }
}


export default DocumentationItem;
