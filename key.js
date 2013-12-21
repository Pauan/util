// TODO: Not quite correct, but it's the best I can do
define(function () {
  "use strict";

  var id  = 0
    , sId = "__private__0"

  function Key() {
    if (!(this instanceof Key)) {
      return new Key()
    }
    this[sId] = "__private__" + (++id)
  }
  Key.prototype.toString = function () {
    return this[sId]
  }

  function isKey(x) {
    return x instanceof Key
  }

  return Object.freeze({
    Key: Key,
    isKey: isKey,
  })
})
