import RealmCollectionProxy from "./RealmCollectionProxy";

class RealmListProxy extends RealmCollectionProxy {
    constructor(realmCollection, entityClass) {
        super(realmCollection, entityClass);
    }

    get realmList() {
        return this.realmCollection;
    }

    pop() {
        return this.createEntity(this.realmList.pop());
    }

    push(...values) {
        this.realmList.push(...values);
    }

    shift() {
        return this.createEntity(this.realmList.shift());
    }

    splice(index, count, ...values) {
        return this.realmList.splice(index, count, ...values);
    }

    unshift(...values) {
        return this.realmList.unshift(...values);
    }
}

export default RealmListProxy;
