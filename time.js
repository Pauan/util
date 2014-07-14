goog.provide("util.time")

goog.require("util.math")

goog.scope(function () {
  /**
   * TODO this probably isn't super-robust, but it should work for common cases
   * @type {null|number}
   */
  var iMax = null

  util.time.millisecond = 1
  util.time.second      = 1000   * util.time.millisecond
  util.time.minute      = 60     * util.time.second
  util.time.hour        = 60     * util.time.minute
  util.time.day         = 24     * util.time.hour
  //util.time.week        = 7      * util.time.day
  //util.time.year        = 365.25 * util.time.day

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
   * @param {number} x
   * @return {number}
   */
  util.time.toLocalTime = function (x) {
    return x - (new Date(x)["getTimezoneOffset"]() * util.time.minute)
  }

  /**
   * @param {number} x
   * @return {number}
   */
  util.time.toMidnight = function (x) {
    var t = new Date(x)
    t["setHours"](0)
    t["setMinutes"](0)
    t["setSeconds"](0)
    t["setMilliseconds"](0)
    return +t
  }

  /**
   * @typedef {{ millisecond: number,
   *             second: number,
   *             minute: number,
   *             hour: number,
   *             day: number,
   *             month: (number|undefined),
   *             year: (number|undefined) }}
   */
  var date_diff

  function isDiff(x, y, s) {
    return x[s]() !== y[s]()
  }

  function getDiff(x, y, s) {
    return util.math.abs(y[s]() - x[s]())
  }

  /**
   * TODO test
   *   new Date(2000, 11, 31, 23, 59, 59, 999)
   *   new Date(2001, 0, 1, 0, 0, 0, 0)
   * TODO test
   *   new Date(2000, 5, 4, 23, 59, 59, 999)
   *   new Date(2000, 5, 5, 0, 0, 0, 0)
   * TODO test
   *   new Date(2000, 5, 5, 23, 59, 59, 999)
   *   new Date(2000, 5, 5, 0, 0, 0, 0)
   * @param {number} x1
   * @param {number} y1
   * @return {!date_diff}
   */
  util.time.dateDifference = function (x1, y1) {
    var x2 = new Date(x1)
      , y2 = new Date(y1)

    var o         = {}

    o.year        = getDiff(x2, y2, "getFullYear")

    //o.month       = getDiff(x2, y2, "getMonth")

    o.millisecond = util.math.abs(y2 - x2)
    o.second      = util.math.floor(o.millisecond / util.time.second)
    o.minute      = util.math.floor(o.millisecond / util.time.minute)
    o.hour        = util.math.floor(o.millisecond / util.time.hour)
    o.day         = util.math.floor(o.millisecond / util.time.day)

    if (o.second === 0 && isDiff(x2, y2, "getSeconds")) {
      o.second = 1
    }
    if (o.minute === 0 && isDiff(x2, y2, "getMinutes")) {
      o.minute = 1
    }
    if (o.hour === 0 && isDiff(x2, y2, "getHours")) {
      o.hour = 1
    }
    if (o.day === 0 && isDiff(x2, y2, "getDate")) {
      o.day = 1
    }
    /*if (o.year === 1) {
      o.month = getDiff(x2, y2, "getMonth") + (12 * o.year)
    } else {
      o.month = getDiff(x2, y2, "getMonth") + (12 * o.year)
    }*/

    return o
  }

  /**
   * @param {number} x
   * @param {number} y
   * @return {!date_diff}
   */
  util.time.difference = function (x, y) {
    var diff = util.math.abs(y - x)
    return {
      millisecond: diff,
      second: util.math.floor(diff / util.time.second),
      minute: util.math.floor(diff / util.time.minute),
      hour:   util.math.floor(diff / util.time.hour),
      day:    util.math.floor(diff / util.time.day)
      //week:   util.math.floor(diff / util.time.week),
      //year:   util.math.floor(diff / util.time.year)
    }
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
