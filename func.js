goog.provide("util.func")

goog.scope(function () {
  util.func.apply = function (f, self, a) {
    return f["apply"](self, a)
  }
})