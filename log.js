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
  util.log.assert = function anon(x, s) {
    if (util.log.DEBUG && !x) {
      // Shows the stack trace, with the call to util.log.assert stripped out
      //console.log(new Error("Assertion failed").stack.replace(/^(.*)\n    at .*/, "$1"))
      //console.error("Assertion failed")
      //console.trace("Assertion failed")
      // TODO
      var t
      if (s == null) {
        t = new Error("Assertion failed")
      } else {
        t = new Error("Assertion failed: " + s)
      }
			//Error["captureStackTrace"](t, anon)
      //localStorage["previousAssertion"] = t
      console["log"](t["stack"])
      throw 42
    }
  }

	/**
	 * @param {string=} s
	 */
  util.log.fail = function (s) {
    util.log.assert(false, s)
  }

  /**
   * @type {function(...[*]):void}
   */
  util.log.log = (util.log.DEBUG ? func.bind(console["log"], console) : function () {})
})
