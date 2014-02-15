goog.provide("util.time")

goog.scope(function () {
  /**
   * TODO this probably isn't super-robust, but it should work for common cases
   * @type {null|number}
   */
  var iMax = null

  /**
   * @return {number}
   */
  util.time.now = function () {
    return Date["now"]()
  }

  /**
   * @return {number}
   */
  util.time.timestamp = function () {
    var x = util.time.now()
    if (iMax === null || x > iMax) {
      iMax = x
    } else {
      x = ++iMax
    }
    return x
  }

  /**
   * @param {function():void} f
   * @param {number=} duration
   * @return {{ iterations: number, milliseconds: number, memory: !Object }}
   */
  util.time.benchmark = function (f, duration) {
    if (duration == null) {
      duration = 10000
    }

    var i   = 0
      , t   = performance
      , mem = {}

    // TODO check this
    for (var s in t["memory"]) {
      mem[s] = t["memory"][s]
    }

    var start = t["now"]()
      , end   = start + duration
      , curr

    while ((curr = t["now"]()) < end) {
      f()
      ++i
    }

    for (var s in t["memory"]) {
      mem[s] = t["memory"][s] - mem[s]
    }

    return {
      iterations: i,
      milliseconds: (curr - start) / i,
      memory: mem
    }
  }
})
