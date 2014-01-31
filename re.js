goog.provide("util.re")

// TODO use util.func ?
goog.scope(function () {
  var top = /(?:)/

  util.re.test = function (str, re) {
    top["test"]["call"](re, str)
  }

  util.re.replace = function (str, re, rep) {
    ""["replace"]["call"](str, re, rep)
  }
})
