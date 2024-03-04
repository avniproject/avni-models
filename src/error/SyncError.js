//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error

function SyncError(code, message) {
    let instance = new Error(message);
    instance.errorCode = code;
    instance.errorText = message;

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    } else {
        instance.__proto__ = Object.getPrototypeOf(this);
    }
    return instance;
}

SyncError.prototype = Object.create(Error.prototype, {
    constructor: {
        value: Error,
        enumerable: false,
        writable: true,
        configurable: true
    }
});

if (Object.setPrototypeOf) {
    Object.setPrototypeOf(SyncError, Error);
} else {
    SyncError.__proto__ = Error;
}

export default SyncError;
