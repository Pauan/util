goog.provide("util.func")

goog.scope(function () {
  var fn = (function () {})

  /**
   * @param {function(this:S, ...T):R} f
   * @param {S} self
   * @param {!Array.<T>} a
   * @return {R}
   * @template T, R, S
   */
  util.func.apply = function (f, self, a) {
    return fn["apply"]["call"](f, self, a)
  }

  /**
   * @param {function(...T):R} f
   * @param {S} self
   * @return {function(this:S, ...T):R}
   * @template T, R, S
   */
  util.func.bind = function (f, self) {
    return fn["bind"]["call"](f, self)
  }
})
