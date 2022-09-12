import _ from 'lodash';

class EntityMapper {
  constructor() {
    //https://www.martinfowler.com/eaaCatalog/identityMap.html
    this.identityMap = new Map();
  }

  toValueObject(realmObject, voClass) {
    if (_.isNil(realmObject)) return null;

    const valueObject = EntityMapper.mapPrimitiveFields(voClass, realmObject);
    if (valueObject.mapNonPrimitives)
      valueObject.mapNonPrimitives(realmObject, this);
    return valueObject;
  }

  static mapPrimitiveFields(aClass, realmObject) {
    const properties = Object.keys(aClass.schema.properties);
    const valueObject = new aClass();
    properties.forEach((x) => valueObject[x] = realmObject[x]);
    return valueObject;
  }

  toValueObjectCollection(realmCollection, voClass) {
    return realmCollection.map((x) => this.toValueObject(x, voClass));
  }

  toEntity(realmObject, entityClass) {
    if (_.isNil(realmObject)) return null;

    let entity = this.identityMap.get(realmObject.uuid);
    if (!_.isNil(entity))
      return entity;

    entity = EntityMapper.mapPrimitiveFields(entityClass, realmObject);
    this.identityMap.set(entity.uuid, entity);

    if (!entity.mapNonPrimitives)
      throw new Error(`mapNonPrimitives not present in ${entity.constructor && entity.constructor.name}, also recommended extend the entity from BaseEntity.`);
    entity.mapNonPrimitives(realmObject, this);
    return entity;
  }

  toEntityCollection(realmCollection, entityClass) {
    return realmCollection.map((x) => this.toEntity(x, entityClass));
  }
}

export default EntityMapper;
