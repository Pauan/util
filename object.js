goog.provide("util.object")

goog.scope(function () {
  /**
   * @type {function(string):boolean}
   */
  var hasOwn = {}["hasOwnProperty"]

  /**
   * @param {!Object.<K, V>} x
   * @return {!Object.<K, V>}
   * @template K, V
   */
  util.object.clone = function (x) {
    return Object["create"](x)
  }

  /**
   * @param {!Object.<K>} o
   * @param {K} s
   * @return {boolean}
   * @template K
   */
  util.object.hasOwn = function (o, s) {
    return hasOwn["call"](o, s)
  }

  // TODO should this iterate over the prototype or not?
  /**
   * @param {!Object.<K, V>} x
   * @param {function(V, K):void} f
   * @template K, V
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
   * @param {!Object.<K>} x
   * @return {!Array.<K>}
   * @template K
   */
  util.object.keys = function (x) {
    var r = []
    for (var s in x) {
      if (util.object.hasOwn(x, s)) {
        // TODO util.array
        r["push"](s)
      }
    }
    return r
  }

  /**
   * @param {!Object.<K, V>} x
   * @param {!Object.<K, V>} y
   * @param {K} s
   * @template K, V
   */
  util.object.copyProperty = function (x, y, s) {
    Object["defineProperty"](x, s, Object["getOwnPropertyDescriptor"](y, s))
  }

  /**
   * @param {!Object.<K, V>} x
   * @return {!Object.<K, V>}
   * @template K, V
   */
  util.object.copy = function (x) {
    var p = Object["getPrototypeOf"](x)
      , o = util.object.clone(p)
      , a = Object["getOwnPropertyNames"](x)
    // TODO util.array
    for (var i = 0, iLen = a["length"]; i < iLen; ++i) {
      util.object.copyProperty(o, x, a[i])
    }
    return o
  }
})
