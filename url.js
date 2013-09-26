define(function () {
  "use strict";

  // TODO: doesn't handle ALL URL syntax, only the most common
  function parse(s) {
    var a = /^([^:]+:\/\/)?([^@]+@)?([^:\/]+)(:[0-9]+)?([^?#]*\/)?([^?#\/]*)([^#]*)(.*)$/.exec(s)
    if (a) {
      var r       = {}
      r.protocol  = a[1] || ""
      r.authority = a[2] || ""
      r.domain    = a[3]
      r.port      = a[4] || ""
      r.path      = a[5] || ""
      r.file      = a[6]
      r.query     = a[7]
      r.hash      = a[8]
      return r
    }
  }
  
  function toString(x) {
    return x.protocol + x.authority + x.domain + x.port + x.path + x.file + x.query + x.hash
  }
  
  function simplify(x) {
    var y = {}
    
    if (x.protocol === "https://") {
      y.protocol = "http://"
    } else {
      y.protocol = x.protocol
    }

    y.authority = x.authority
    
    // http://en.wikipedia.org/wiki/List_of_Internet_top-level_domains
    y.domain = x.domain.replace(/^www\.|\.\w\w$/g, "") // .co.uk
                       .replace(/\.(?:aero|asia|biz|cat|com|co|coop|info|int|jobs|mobi|museum|name|net|org|pro|tel|travel|xxx|edu|gov|mil)$/, "")
                       // TODO: is this needed?
                       .replace(/\.\w\w$/, "") // .ac.edu
    
    y.port = x.port
    y.path = x.path
    y.file = x.file
    y.query = x.query
    y.hash = x.hash
    return y
  }

  function superMinify(x) {
    var y = simplify(x)

    if (x.protocol === "http://" || x.protocol === "https://") {
      y.protocol = ""
    } else if (x.protocol) {
      y.protocol = x.protocol.replace(/:\/\/$/, "") + " "
    }

    if (x.path === "/") {
      y.path = ""
    // TODO: should this be run even if `x` is "" ?
    } else if (x.path && !x.file && !x.query) {
      y.path = " " + decodeURIComponent(x.path)
    }

    if (x.file && !x.query) {
      y.file = " " + decodeURIComponent(x.file).replace(/\.(?:html?|php|asp)$/, "")
                                               .replace(/_|\-/g, " ")
    }

    if (x.query) {
      y.query = " " + decodeURIComponent(x.query).replace(/^\?/, "")
                                                 .replace(/\+/g, " ")
                                                 .replace(/=/g, ": ")
                                                 .replace(/&/g, " | ")
    }

    if (x.hash) {
      y.hash = " " + decodeURIComponent(x.hash)
    }

    return y
  }

  return Object.freeze({
    toString: toString,
    simplify: simplify,
    parse: parse,
    superMinify: superMinify,
  })
})
