goog.provide("util.url")

goog.require("util.array")
goog.require("util.re")

goog.scope(function () {
  var array = util.array
    , re    = util.re

  // http://en.wikipedia.org/wiki/URI_scheme#Generic_syntax
  var reUri = /^([a-zA-Z][a-zA-Z0-9\+\.\-]*):(?:\/\/(?:([^\@]+)\@)?([^\/\?\#\:]+)(?:\:([0-9]+))?)?([^\?\#]*)?(?:\?([^\#]*))?(?:\#(.*))?$/

  /**
   * @typedef {{ scheme:    (string|null),
   *             authority: (string|null),
   *             hostname:  (string|null),
   *             port:      (number|null),
   *             path:      (!Array.<string>|null),
   *             query:     (string|null),
   *             fragment:  (string|null) }}
   */
  var uriObject

  /**
   * @param {string} s
   * @return {uriObject}
   */
  util.url.parseURI = function (s) {
    var a = re.exec(s, reUri)
    if (a) {
      return {
                   // TODO util.string
        scheme:    a[1]["toLowerCase"](),
        authority: a[2] || null,
        hostname:  a[3] || null,
        port:      (+a[4] || null),
        path:      (a[5]
                     ? re.split(a[5], /\//g)
                     : null),
        query:     a[6] || null,
        fragment:  a[7] || null
      }
    } else {
      throw new Error("invalid URI: " + s)
    }
  }

  /**
   * @param {uriObject} o
   * @return {string}
   */
  util.url.printURI = function (o) {
    var s = []
    if (o.scheme) {
      array.push(s, o.scheme)
      array.push(s, ":")
    }
    if (o.authority || o.hostname || o.port) {
      if (o.scheme) {
        array.push(s, "//")
      }
      if (o.authority) {
        array.push(s, o.authority)
        array.push(s, "@")
      }
      if (o.hostname) {
        array.push(s, o.hostname)
      }
      if (o.port) {
        array.push(s, ":")
        array.push(s, o.port)
      }
    }
    if (o.path) {
      array.push(s, array.join(o.path, "/"))
    }
    if (o.query) {
      array.push(s, "?")
      array.push(s, o.query)
    }
    if (o.fragment) {
      array.push(s, "#")
      array.push(s, o.fragment)
    }
    return array.join(s, "")
  }

  /**
   * @param {uriObject} x
   * @return {uriObject}
   */
  util.url.simplify = function (x) {
    var y = {}

    if (x.scheme === "http" || x.scheme === "https") {
      y.scheme = null
    } else {
      y.scheme = x.scheme
    }

    if (x.authority) {
      y.authority = x.authority
    }
    if (x.hostname) {
      // http://en.wikipedia.org/wiki/List_of_Internet_top-level_domains
      y.hostname = re.replace(re.replace(re.replace(x.hostname, /^www\.|\.\w\w$/g, ""), // .co.uk
                                                                /\.(?:aero|asia|biz|cat|com|co|coop|info|int|jobs|mobi|museum|name|net|org|pro|tel|travel|xxx|edu|gov|mil)$/, ""),
                                                                // TODO: is this needed?
                                                                /\.\w\w$/, "") // .ac.edu
    }
    if (x.port) {
      y.port = x.port
    }
    if (x.path) {
      y.path = x.path
    }
    if (x.query) {
      y.query = x.query
    }
    if (x.fragment) {
      y.fragment = x.fragment
    }
    return y
  }
})
