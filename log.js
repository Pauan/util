goog.provide("util.log")

goog.scope(function () {
  util.log.assert = function (x) {
    if (goog.DEBUG && !x) {
      console.log(new Error("Assertion failed").stack)
      throw new Error()
    }
  }

  util.log.fail = function () {
    util.log.assert(false)
  }

  util.log.log = (goog.DEBUG ? goog.bind(console.log, console) : function () {})
})