goog.provide("util.object")

goog.scope(function () {
  var array = util.array

  /**
   * @type {function(string):boolean}
   */
  var hasOwn = {}["hasOwnProperty"]

  /**
   * @type {function(!Object):!Object}
   */
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
   * @param {!Object.<S, T>} x
   * @param {function(T, S):void} f
   * @template T, S
   */
  util.object.each = function (x, f) {
    for (var s in x) {
      f(x[s], s)
    }
  }

  /**
   * @param {*} x
   * @param {*} y
   * @return {boolean}
   */
  util.object.is = function (x, y) {
    if (x === y) {
      return true
    // Check for NaN
    } else {
      return x !== x && y !== y
    }
  }

  util.object.isnt = function (x, y) {
    return !util.object.is(x, y)
  }

  /**
   * @param {!Object.<S>} x
   * @return {!Array.<S>}
   * @template S
   */
  util.object.keys = function (x) {
    var r = []
    for (var s in x) {
      if (util.object.hasOwn(x, s)) {
        // TODO util.array
        r["push"](r, s)
      }
    }
    return r
  }
})
