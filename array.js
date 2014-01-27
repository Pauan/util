goog.provide("util.array")

goog.require("util.func")

goog.scope(function () {
  var func = util.func

  /**
   * @typedef {!Array|!Arguments|string}
   */
  util.array.ArrayLike

  /**
   * @param {!util.array.ArrayLike} a
   * @param {string} s
   * @return {string}
   */
  util.array.join = function (a, s) {
    return []["join"]["call"](a, s)
  }

  /**
   * TODO doesn't work on strings
   * @param {!util.array.ArrayLike} a
   * @param {number} index
   * @param {*} x
   */
  util.array.insertAt = function (a, index, x) {
    []["splice"]["call"](a, index, 0, x)
  }

  /**
   * TODO doesn't work on strings
   * @param {!util.array.ArrayLike} a
   * @param {number} index
   */
  util.array.removeAt = function (a, index) {
    []["splice"]["call"](a, index, 1)
  }

  /**
   * @param {!util.array.ArrayLike} a
   * @return {number}
   */
  util.array.len = function (a) {
    return a["length"]
  }

  /**
   * TODO doesn't work on strings
   * @param {!util.array.ArrayLike} a
   * @param {*} x
   * @return {number}
   */
  util.array.push = function (a, x) {
    return a["push"](x) - 1
  }

  /**
   * @param {!util.array.ArrayLike} a
   * @param {number=} start
   * @param {number=} end
   * @return {!Array}
   */
  util.array.slice = function (a, start, end) {
    return []["slice"]["call"](a, start, end)
  }

  /**
   * @param {!util.array.ArrayLike} a
   * @param {function(*,number=):boolean} f
   */
  util.array.some = function (a, f) {
    for (var i = 0, iLen = util.array.len(a); i < iLen; ++i) {
      if (f(a[i], i)) {
        return true
      }
    }
    return false
  }

  /**
   * @param {!util.array.ArrayLike} a
   * @return {*}
   */
  util.array.last = function (a) {
    return a[util.array.len(a) - 1]
  }

  /**
   * @param {!util.array.ArrayLike.<T>} a
   * @param {function(T,number=):void} f
   * @template T
   */
  util.array.each = function (a, f) {
    for (var i = 0, iLen = util.array.len(a); i < iLen; ++i) {
      f(a[i], i)
    }
  }

  /**
   * @param {!util.array.ArrayLike} a
   * @param {*} x
   * @return {number}
   */
  util.array.indexOf = function (a, x) {
    for (var i = 0, iLen = util.array.len(a); i < iLen; ++i) {
      if (a[i] === x) {
        return i
      }
    }
    return -1
  }

  /**
   * @param {...!util.array.ArrayLike} var_args
   * @return {!Array}
   */
  util.array.concat = function (var_args) {
    var r = []
    util.array.each(arguments, function (x) {
      util.array.each(x, function (x) {
        util.array.push(r, x)
      })
    })
    return r
  }

  /**
   * @param {!util.array.ArrayLike.<T>} a
   * @param {function(T,number=):R} f
   * @return {!Array.<R>}
   * @template T, R
   */
  util.array.map = function (a, f) {
    var r = []
    util.array.each(a, function (x, i) {
      util.array.push(r, f(x, i))
    })
    return r
  }

  /**
   * @param {!util.array.ArrayLike} a
   * @return {!Array}
   */
  util.array.toArray = function (a) {
    return util.array.map(a, function (x) {
      return x
    })
  }

  util.array.clone = util.array.toArray

  /**
   * @param {!util.array.ArrayLike.<T>} a
   * @param {function(T,number=):boolean} f
   * @template T
   */
  util.array.every = function (a, f) {
    return !util.array.some(a, function (x, i) {
      return !f(x, i)
    })
  }
})
