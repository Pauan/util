goog.provide("util.log")

goog.scope(function () {
  util.log.assert = function (x) {
    if (goog.DEBUG && !x) {
      // Shows the stack trace, with the call to util.log.assert stripped out
      //console.log(new Error("Assertion failed").stack.replace(/^(.*)\n    at .*/, "$1"))
      console.error("Assertion failed")
      throw new Error()
    }
  }

  util.log.fail = function () {
    util.log.assert(false)
  }

  util.log.log = (goog.DEBUG ? goog.bind(console.log, console) : function () {})
})
