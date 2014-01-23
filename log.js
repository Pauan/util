goog.provide("util.log")

goog.scope(function () {
  util.log.log = function (s) {
    if (goog.DEBUG) {
      console.log(s)
    }
  }
})