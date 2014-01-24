goog.provide("util.func")

goog.scope(function () {
  var fn = (function () {})

  util.func.apply = function (f, self, a) {
    return fn["apply"]["call"](f, self, a)
  }

  util.func.bind = function (f, self) {
    return fn["bind"]["call"](f, self)
  }
})
