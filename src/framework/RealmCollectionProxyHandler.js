import _ from "lodash";

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/get
// https://stackoverflow.com/a/1711405/766175
const RealmCollectionProxyHandler = {
  get: function (target, name) {
    if (typeof name !== 'symbol' && !isNaN(name) && !isNaN(parseInt(name)))
      return target.getAt(Number.parseInt(name));
    return Reflect.get(...arguments);
  }
}

export default RealmCollectionProxyHandler;
