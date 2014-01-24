goog.provide("util.array")

goog.scope(function () {
  util.array.insertAt = function (a, index, x) {
    []["splice"]["call"](a, index, 0, x)
  }

  util.array.removeAt = function (a, index) {
    []["splice"]["call"](a, index, 1)
  }

  util.array.len = function (a) {
    return a["length"]
  }

  util.array.push = function (a, x) {
    return a["push"](x) - 1
  }

  util.array.slice = function (a, start, end) {
    return []["slice"]["call"](a, start, end)
  }

  util.array.some = function (a, f) {
    for (var i = 0, iLen = util.array.len(a); i < iLen; ++i) {
      if (f(a[i], i)) {
        return true
      }
    }
    return false
  }

  util.array.last = function (a) {
    return a[util.array.len(a) - 1]
  }

  util.array.each = function (a, f) {
    for (var i = 0, iLen = util.array.len(a); i < iLen; ++i) {
      f(a[i], i)
    }
  }

  util.array.indexOf = function (a, x) {
    for (var i = 0, iLen = util.array.len(a); i < iLen; ++i) {
      if (a[i] === x) {
        return i
      }
    }
    return -1
  }

  util.array.map = function (a, f) {
    var r = []
    util.array.each(a, function (x, i) {
      util.array.push(r, f(x, i))
    })
    return r
  }

  util.array.toArray = function (a) {
    return util.array.map(a, function (x) {
      return x
    })
  }

  util.array.clone = util.array.toArray

  util.array.every = function (a, f) {
    return !util.array.some(a, function (x, i) {
      return !f(x, i)
    })
  }
})
