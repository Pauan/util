goog.provide("util.object")

goog.require("util.array")

goog.scope(function () {
  var array = util.array

  /**
   * @type {function(string):boolean}
   */
  var hasOwn = {}["hasOwnProperty"]

  util.object.create = Object["create"]

  /**
   * @param {!Object} o
   * @param {string} s
   * @return {boolean}
   */
  util.object.hasOwn = function (o, s) {
    return hasOwn["call"](o, s)
  }

  // TODO should this iterate over the prototype or not?
  /**
   * @param {!Object} x
   * @param {function(*, string):void} f
   */
  util.object.each = function (x, f) {
    for (var s in x) {
      f(x[s], s)
    }
  }

  /**
   * @param {!Object} x
   * @return {!Array}
   */
  util.object.keys = function (x) {
    var r = []
    for (var s in x) {
      if (util.object.hasOwn(x, s)) {
        array.push(r, s)
      }
    }
    return r
  }
})
