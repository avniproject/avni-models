import _ from "lodash";

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/get
const RealmCollectionProxyHandler = {
    get: function(target, name) {
        if (Number.isInteger(name))
            return target.getAt(Number.parseInt(name));
        return Reflect.get(...arguments);
    }
}

export default RealmCollectionProxyHandler;
