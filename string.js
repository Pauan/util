goog.provide("util.string")

goog.scope(function () {
  util.string.upper = function (x) {
    return x["toLocaleUpperCase"]()
  }

  util.string.sorter = function (x, y) {
    return x["localeCompare"](y)
  }

  util.string.upperSorter = function (x, y) {
    return util.string.sorter(util.string.upper(x), util.string.upper(y))
  }
})
