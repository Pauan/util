// TODO: Not quite correct, but it's the best I can do
goog.provide("util.Symbol")

goog.scope(function () {
  var id  = 0
    , sId = "new Symbol(0)"

  /**
   * @constructor
   */
  function Symbol1(s) {
    if (s == null) {
      this[sId] = "Symbol(" + (++id) + ")"
    } else {
      this[sId] = "Symbol(\"" + s + "\", " + (++id) + ")"
    }
    Object.freeze(this) // TODO is this a good idea ?
  }
  Symbol1.prototype.toString = function () {
    return this[sId]
  }

  util.Symbol = function (s) {
    return new Symbol1(s)
  }
})