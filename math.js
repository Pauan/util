goog.provide("util.math")

goog.scope(function () {
  /**
   * @param {number} x
   * @return {number}
   */
  util.math.abs = function (x) {
    if (x < 0) {
      return -x
    } else {
      return x
    }
  }

  /**
   * @param {number} x
   * @param {number} y
   * @return {number}
   */
  util.math.max = function (x, y) {
    if (x < y) {
      return y
    } else {
      return x
    }
  }

  /**
   * @param {number} x
   * @param {number} y
   * @return {number}
   */
  util.math.min = function (x, y) {
    if (x > y) {
      return y
    } else {
      return x
    }
  }

  /**
   * @type {function(number):number}
   */
  util.math.sqrt = Math.sqrt

  /**
   * http://www.johndcook.com/blog/2010/06/02/whats-so-hard-about-finding-a-hypotenuse/
   * @param {number} x
   * @param {number} y
   * @return {number}
   */
  util.math.hypot = function (x, y) {
    x = util.math.abs(x)
    y = util.math.abs(y)
    // TODO could optimize a bit...
    var max = util.math.max(x, y)
      , min = util.math.min(x, y)
      , r   = min / max
    return max * util.math.sqrt(1 + (r * r))
  }
})
