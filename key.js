// TODO: Not quite correct, but it's the best I can do
define(function () {
  "use strict";

  var id  = 0
    , sId = "Key(null, 0)"

  function Key(s) {
    if (!(this instanceof Key)) {
      return new Key(s)
    }
    if (s == null) {
      this[sId] = "Key(null, " + (++id) + ")"
    } else {
      this[sId] = "Key(\"" + s + "\", " + (++id) + ")"
    }
    Object.freeze(this) // TODO is this a good idea ?
  }
  Key.prototype.toString = function () {
    return this[sId]
  }

  return Object.freeze({
    Key: Key,
  })
})