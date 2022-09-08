import BaseEntity from "./BaseEntity";
import DocumentationItem from "./DocumentationItem";
import General from "./utility/General";

class Documentation extends BaseEntity {
    static schema = {
        name: 'Documentation',
        primaryKey: 'uuid',
        properties: {
            uuid: 'string',
            name: 'string',
            documentationItems: {type: "list", objectType: "DocumentationItem"},
            voided: {type: "bool", default: false},
        }
    };

  mapNonPrimitives(realmObject, entityMapper) {
    this.documentationItems = entityMapper.toEntityCollection(realmObject.documentationItems, DocumentationItem);
  }

  uuid: string;
    name: string;
    documentationItems: DocumentationItem[];
    voided: boolean;

    static merge = () => BaseEntity.mergeOn("documentationItems");

    static associateChild(child, childEntityClass, childResource, entityService) {
        let documentation = BaseEntity.getParentEntity(
            entityService,
            childEntityClass,
            childResource,
            "documentationUUID",
            Documentation.schema.name
        );
        documentation = General.pick(documentation, ["uuid"], ["documentationItems"]);
        if (childEntityClass === DocumentationItem) {
            BaseEntity.addNewChild(child, documentation.documentationItems);
        } else throw `${childEntityClass.name} not support by ${Documentation.name}`;
        return documentation;
    }

    static fromResource(resource) {
        const documentation = new Documentation();
        documentation.uuid = resource.uuid;
        documentation.name = resource.name;
        documentation.voided = resource.voided;
        return documentation;
    }

}


export default Documentation;
