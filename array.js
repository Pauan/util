goog.provide("util.array")

goog.require("util.math")
goog.require("util.func")
goog.require("util.log")
goog.require("util.object")

goog.scope(function () {
  var func   = util.func
    , assert = util.log.assert

  /**
   * @typedef {!Array|!Arguments|string}
   */
  util.array.ArrayLike

  /**
   * @param {!util.array.ArrayLike.<string>} a
   * @param {string} s
   * @return {string}
   */
  util.array.join = function (a, s) {
    return []["join"]["call"](a, s)
  }

  /**
   * @param {!util.array.ArrayLike.<T>} a
   * @param {function(T, T):number} f
   * @template T
   */
  util.array.sort = function (a, f) {
    ;[]["sort"]["call"](a, f)
  }

  /**
   * @param {!util.array.ArrayLike.<T>} a
   * @param {number} index
   * @param {T} x
   * @return {number}
   * @template T
   */
  util.array.insertAt = function (a, index, x) {
    ;[]["splice"]["call"](a, index, 0, x)
    return index
  }

  /**
   * @param {!util.array.ArrayLike} a
   * @param {number} index
   * @return {number}
   */
  util.array.removeAt = function (a, index) {
    ;[]["splice"]["call"](a, index, 1)
    return index
  }

  /**
   * @param {!util.array.ArrayLike} a
   * @return {number}
   */
  util.array.len = function (a) {
    return a["length"]
  }

  /**
   * @param {!util.array.ArrayLike} a
   * @param {number} i
   */
  util.array.resize = function (a, i) {
    a["length"] = i
  }

  /**
   * @param {!util.array.ArrayLike.<T>} a
   * @param {T} x
   * @return {number}
   * @template T
   */
  util.array.push = function (a, x) {
    return []["push"]["call"](a, x) - 1
  }

  /**
   * @param {!util.array.ArrayLike} a
   * @return {number}
   */
  util.array.pop = function (a) {
    ;[]["pop"]["call"](a)
    return util.array.len(a)
  }

  /**
   * @param {!util.array.ArrayLike.<T>} a
   * @param {number=} start
   * @param {number=} end
   * @return {!Array.<T>}
   * @template T
   */
  util.array.slice = function (a, start, end) {
    return []["slice"]["call"](a, start, end)
  }

  /**
   * @param {!util.array.ArrayLike} a
   * @param {number} i
   * @return {boolean}
   */
  util.array.indexInRange = function (a, i) {
    return i >= 0 && i < util.array.len(a)
  }

  /**
   * @param {!util.array.ArrayLike.<T>} a
   * @param {T} x
   * @param {function(T, T):boolean} sort
   * @return {boolean}
   * @template T
   */
  util.array.isElementSorted = function (a, x, sort) {
    var i = util.array.indexOf(a, x)
    if (i === -1) {
      return false
    } else {
      var prev = i - 1
        , next = i + 1
      return (!util.array.indexInRange(a, prev) || sort(a[prev], x)) &&
             (!util.array.indexInRange(a, next) || sort(x, a[next]))
    }
  }

  /**
   * @param {!util.array.ArrayLike.<T>} a
   * @param {T} x
   * @param {function(T, T):boolean} sort
   * @return {number}
   * @template T
   */
  util.array.insertSorted = function (a, x, sort) {
    var i   = 0
      , end = util.array.len(a)
    // TODO verify that this is correct
    // TODO check whether 10 is a good cutoff or not
    while ((end - i) > 10) {
      var pivot = util.math.floor((end - i) / 2)
      assert(util.array.indexInRange(a, pivot - 1))
      assert(util.array.indexInRange(a, pivot))
      var prev = sort(a[pivot - 1], x)
        , next = sort(x, a[pivot])
      // TODO is this correct ?
      if (prev && next) {
        return util.array.insertAt(a, pivot, x)
      } else if (prev) {
        end = pivot
      } else if (next) {
        i = pivot
      }
    }
    while (i < end) {
      var y = a[i]
      if (util.object.is(x, y)) {
        throw new Error("sorted array cannot have duplicates")
      } else if (sort(x, y)) {
        return util.array.insertAt(a, i, x)
      }
      ++i
    }
    return util.array.push(a, x)
  }

  function sort(x, y) {
    return x <= y
  }

  var a1 = [1, 2, 3, 5, 6, 7]
  util.array.insertSorted(a1, 4, sort)
  console["log"](a1)

  var a2 = [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13]
  util.array.insertSorted(a2, 7, sort)
  console["log"](a2)

  /**
   * @param {!util.array.ArrayLike.<T>} a
   * @param {T} x
   * @template T
   */
  util.array.remove = function (a, x) {
    var i = util.array.indexOf(a, x)
    if (i !== -1) {
      util.array.removeAt(a, i)
    }
  }

  /**
   * @param {!util.array.ArrayLike.<T>} a
   * @param {function(T,number=):boolean} f
   * @template T
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
   * @param {!util.array.ArrayLike.<T>} a
   * @param {number=} i
   * @return {T}
   * @template T
   */
  util.array.last = function (a, i) {
    if (i == null) {
      i = 0
    }
    return a[util.array.len(a) - 1 - i]
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
   * @param {!util.array.ArrayLike.<T>} a
   * @param {function(T,number=):void} f
   * @template T
   */
  util.array.eachReverse = function (a, f) {
    var i = util.array.len(a)
    while (i--) {
      f(a[i], i)
    }
  }

  /**
   * @param {!util.array.ArrayLike.<T>} a
   * @param {T} x
   * @return {number}
   * @template T
   */
  util.array.indexOf = function (a, x) {
    for (var i = 0, iLen = util.array.len(a); i < iLen; ++i) {
      if (util.object.is(a[i], x)) {
        return i
      }
    }
    return -1
  }

  /**
   * @param {...!util.array.ArrayLike.<T>} var_args
   * @return {!Array.<T>}
   * @template T
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
   * @param {I} init
   * @param {!util.array.ArrayLike.<T>} a
   * @param {function(I, T):I} f
   * @return {I}
   * @template I, T
   */
  util.array.foldl = function (init, a, f) {
    util.array.each(a, function (x) {
      init = f(init, x)
    })
    return init
  }

  /**
   * @param {!util.array.ArrayLike.<T>} a
   * @param {function(T, T):T} f
   * @return {T}
   * @template T
   */
  util.array.foldl1 = function (a, f) {
    assert(util.array.len(a) > 0)
    var init = a[0]
    for (var i = 1, iLen = util.array.len(a); i < iLen; ++i) {
      init = f(init, a[i])
    }
    return init
  }

  /**
   * @param {!util.array.ArrayLike.<T>} a
   * @param {function(T,number=):boolean} f
   * @return {!Array.<T>}
   * @template T
   */
  util.array.filter = function (a, f) {
    var r = []
    util.array.each(a, function (x, i) {
      if (f(x, i)) {
        util.array.push(r, x)
      }
    })
    return r
  }

  /**
   * @param {!util.array.ArrayLike.<T>} a
   * @return {!Array.<T>}
   * @template T
   */
  util.array.toArray = function (a) {
    return util.array.map(a, function (x) {
      return x
    })
  }

  util.array.copy = util.array.toArray

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
