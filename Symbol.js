// TODO: Not quite correct, but it's the best I can do
goog.provide("util.Symbol")

goog.scope(function () {
  /**
   * @type {number}
   */
  var id = 0

  /**
   * @param {string=} s
   * @return {string}
   */
  util.Symbol = function (s) {
    if (s == null) {
      return "Symbol(" + (++id) + ")"
    } else {
      return "Symbol(\"" + s + "\", " + (++id) + ")"
    }
  }
})