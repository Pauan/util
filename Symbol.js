// TODO: Not quite correct, but it's the best I can do
goog.provide("util.Symbol")

goog.scope(function () {
  var id = 0

  util.Symbol = function (s) {
    if (s == null) {
      return "Symbol(" + (++id) + ")"
    } else {
      return "Symbol(\"" + s + "\", " + (++id) + ")"
    }
  }
})