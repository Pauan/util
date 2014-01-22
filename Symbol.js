// TODO: Not quite correct, but it's the best I can do
goog.provide("util.Symbol")

goog.scope(function () {
  var id  = 0
    , sId = "Symbol(0)"

  util.Symbol = function (s) {
    var o = {}
    if (s == null) {
      o[sId] = "Symbol(" + (++id) + ")"
    } else {
      o[sId] = "Symbol(\"" + s + "\", " + (++id) + ")"
    }
    o.toString = function () {
      return o[sId]
    }
    return Object.freeze(o)
  }
})