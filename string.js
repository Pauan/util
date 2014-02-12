goog.provide("util.string")

goog.scope(function () {
  var top = ""

  /**
   * @param {string} x
   * @return {string}
   */
  util.string.upper = function (x) {
    return top["toLocaleUpperCase"]["call"](x)
  }

  /**
   * @param {string} x
   * @return {string}
   */
  util.string.lower = function (x) {
    return top["toLocaleLowerCase"]["call"](x)
  }

  /**
   * @param {number} x
   * @return {string}
   */
  util.string.fromUnicode = function (x) {
    // TODO use String["fromCodePoint"]
    return String["fromCharCode"](x)
  }

  /**
   * @param {string} x
   * @param {string} y
   * @return {number}
   */
  util.string.sorter = function (x, y) {
    return top["localeCompare"]["call"](x, y)
  }

  /**
   * @param {string} x
   * @param {string} y
   * @return {number}
   */
  util.string.upperSorter = function (x, y) {
    return util.string.sorter(util.string.upper(x), util.string.upper(y))
  }
})
