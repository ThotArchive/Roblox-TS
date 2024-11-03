var IonicStorageWrapper = (function () {
    function IonicStorageWrapper(storage) {
        this.storage = storage;
    }
    IonicStorageWrapper.prototype.getItem = function (key) {
        return this.storage.get(key);
    };
    IonicStorageWrapper.prototype.removeItem = function (key) {
        return this.storage.remove(key);
    };
    IonicStorageWrapper.prototype.setItem = function (key, value) {
        return this.storage.set(key, value);
    };
    return IonicStorageWrapper;
}());
export { IonicStorageWrapper };
//# sourceMappingURL=IonicStorageWrapper.js.map