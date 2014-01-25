goog.provide("util.array")

goog.require("util.func")

goog.scope(function () {
  var func = util.func

  /**
   * @param {*} a
   * @param {number} index
   * @param {*} x
   */
  util.array.insertAt = function (a, index, x) {
    []["splice"]["call"](a, index, 0, x)
  }

  /**
   * @param {*} a
   * @param {number} index
   */
  util.array.removeAt = function (a, index) {
    []["splice"]["call"](a, index, 1)
  }

  /**
   * @param {*} a
   * @return {number}
   */
  util.array.len = function (a) {
    return a["length"]
  }

  /**
   * @param {*} a
   * @param {*} x
   * @return {number}
   */
  util.array.push = function (a, x) {
    return a["push"](x) - 1
  }

  /**
   * @param {*} a
   * @param {number=} start
   * @param {number=} end
   * @return {!Array}
   */
  util.array.slice = function (a, start, end) {
    return []["slice"]["call"](a, start, end)
  }

  /**
   * @param {*} a
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
   * @param {*} a
   * @return {*}
   */
  util.array.last = function (a) {
    return a[util.array.len(a) - 1]
  }

  /**
   * @param {*} a
   * @param {function(*,number=):void} f
   */
  util.array.each = function (a, f) {
    for (var i = 0, iLen = util.array.len(a); i < iLen; ++i) {
      f(a[i], i)
    }
  }

  /**
   * @param {*} a
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
   * @param {*} a
   * @param {function(*,number=):R} f
   * @return {!Array.<R>}
   * @template R
   */
  util.array.map = function (a, f) {
    var r = []
    util.array.each(a, function (x, i) {
      util.array.push(r, f(x, i))
    })
    return r
  }

  /**
   * @param {*} a
   * @return {!Array}
   */
  util.array.toArray = function (a) {
    return util.array.map(a, function (x) {
      return x
    })
  }

  util.array.clone = util.array.toArray

  /**
   * @param {*} a
   * @param {function(*,number=):boolean} f
   */
  util.array.every = function (a, f) {
    return !util.array.some(a, function (x, i) {
      return !f(x, i)
    })
  }
})
