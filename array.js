goog.provide("util.array")

goog.require("goog.array")

goog.scope(function () {
  var array = goog.array

  util.array.map      = array.map
  util.array.every    = array.every
  util.array.toArray  = array.toArray
  util.array.slice    = array.slice
  util.array.indexOf  = array.indexOf
  util.array.removeAt = array.removeAt
  util.array.clone    = array.clone
  util.array.some     = array.some

  util.array.last = array.peek
  util.array.each = array.forEach
  util.array.insertAt = function (a, index, x) {
    return array.insertAt(a, x, index)
  }

  util.array.len = function (a) {
    return a["length"]
  }

  util.array.push = function (a, x) {
    return a["push"](x) - 1
  }
})
