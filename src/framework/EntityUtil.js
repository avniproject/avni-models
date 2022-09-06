import _ from 'lodash';

class EntityUtil {
  static toModel(realmObject, entityClass) {
    if (_.isNil(realmObject)) return null;

    const properties = Object.keys(entityClass.schema.properties);
    const entity = new entityClass();
    properties.forEach((x) => entity[x] = realmObject[x]);
    entity.mapNonPrimitives(realmObject);
    return entity;
  }

  static toModelCollection(realmCollection, entityClass) {
    return realmCollection.map((x) => EntityUtil.toModel(x, entityClass));
  }
}

export default EntityUtil;
