import _ from "lodash";

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/get
// https://stackoverflow.com/a/1711405/766175

// There is no way to override indexor (i.e. [0] [1] etc) and length
const RealmResultsProxyHandler = {
  get: function (target, name) {
    // console.log("RealmResultsProxyHandler", name);
    if (typeof name !== 'symbol' && !isNaN(name) && !isNaN(parseInt(name))) {
      return target.getAt(Number.parseInt(name));
    } else if (name === "length") {
      return target.getLength();
    }
    return Reflect.get(...arguments);
  }
}

export default RealmResultsProxyHandler;
