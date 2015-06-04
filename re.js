goog.provide("util.re")

// TODO use util.func ?
goog.scope(function () {
  var top = /(?:)/

  // http://www.regular-expressions.info/characters.html
  // \ ^ $ . | ? * + ( ) [ {
  var reEscape = /[\\\^\$\.\|\?\*\+\(\)\[\{]/g

  /**
   * @param {string} s
   * @return {string}
   */
  util.re.escape = function (s) {
    return util.re.replace(s, reEscape, "\\$&")
  }

  /**
   * @param {string} s
   * @param {string=} flags
   * @return {!RegExp}
   */
  util.re.make = function (s, flags) {
    return new RegExp(s, flags)
  }

  /**
   * @param {string} str
   * @param {!RegExp} re
   * @return {boolean}
   */
  util.re.test = function (str, re) {
    return top["test"]["call"](re, str)
  }

  /**
   * @param {string} str
   * @param {!RegExp} re
   * @return {!Array.<string>}
   */
  util.re.exec = function (str, re) {
    return top["exec"]["call"](re, str)
  }

  /**
   * @param {string} str
   * @param {!RegExp} re
   * @param {string|function(...string):string} rep
   * @return {string}
   */
  util.re.replace = function (str, re, rep) {
    return ""["replace"]["call"](str, re, rep)
  }

  /**
   * @param {string} str
   * @param {!RegExp} re
   * @return {!Array.<string>}
   */
  util.re.split = function (str, re) {
    return ""["split"]["call"](str, re)
  }
})
