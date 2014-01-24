goog.provide("util.object")

goog.scope(function () {
  // TODO should this iterate over the prototype or not?
  util.object.each = function (x, f) {
    for (var s in x) {
      f(x[s], s)
    }
  }
})