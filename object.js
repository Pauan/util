goog.provide("util.object")

goog.scope(function () {
  /**
   * @type {function(string):boolean}
   */
  var hasOwn = {}["hasOwnProperty"]

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
      if (hasOwn["call"](x, s)) {
        r.push(s)
      }
    }
    return r
  }
})
