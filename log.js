goog.provide("util.log")

goog.scope(function () {
  util.log.assert = function (x) {
    if (goog.DEBUG && !x) {
      throw new Error()
    }
  }

  util.log.log = (goog.DEBUG ? goog.bind(console.log, console) : function () {})
})