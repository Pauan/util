goog.provide("util.log")

goog.require("util.func")

goog.scope(function () {
  var func = util.func

  /** @define {boolean} */
  util.log.DEBUG = true

  /**
   * @param {boolean} x
   * @param {string=} s
   */
  util.log.assert = function (x, s) {
    if (util.log.DEBUG && !x) {
      // Shows the stack trace, with the call to util.log.assert stripped out
      //console.log(new Error("Assertion failed").stack.replace(/^(.*)\n    at .*/, "$1"))
      //console.error("Assertion failed")
      //console.trace("Assertion failed")
      if (s == null) {
        throw new Error("Assertion failed")
      } else {
        throw new Error("Assertion failed: " + s)
      }
    }
  }

  util.log.fail = function () {
    util.log.assert(false)
  }

  /**
   * @type {function(...[*]):void}
   */
  util.log.log = (util.log.DEBUG ? func.bind(console["log"], console) : function () {})
})
