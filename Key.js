// TODO: Not quite correct, but it's the best I can do
goog.provide("util.Key")

goog.scope(function () {
  var id  = 0
    , sId = "new Key(0)"

  util.Key = function (s) {
    if (s == null) {
      this[sId] = "new Key(" + (++id) + ")"
    } else {
      this[sId] = "new Key(\"" + s + "\", " + (++id) + ")"
    }
    Object.freeze(this) // TODO is this a good idea ?
  }
  util.Key.prototype.toString = function () {
    return this[sId]
  }
})