"use strict";

// http://en.wikipedia.org/wiki/URI_scheme#Generic_syntax
var reUri = /^([a-zA-Z][a-zA-Z0-9\+\.\-]*):(?:\/\/(?:([^\@]+)\@)?([^\/\?\#\:]+)(?:\:([0-9]+))?)?([^\?\#]*)?(?:\?([^\#]+))?(?:\#(.+))?$/

function parseURI(s) {
  var a = reUri.exec(s)
  if (a) {
    return {
      scheme:    a[1].toLowerCase(),
      authority: a[2] || null,
      hostname:  a[3] || null,
      port:      (+a[4] || null),
      path:      (a[5]
                   ? a[5].split(/\//g)
                   : null),
      query:     a[6] || null,
      fragment:  a[7] || null
    }
  } else {
    throw new Error("invalid URI: " + s)
  }
}
exports.parseURI = parseURI

function printURI(o) {
  var s = []
  if (o.scheme) {
    s.push(o.scheme)
    s.push(":")
  }
  if (o.authority || o.hostname || o.port) {
    if (o.scheme) {
      s.push("//")
    }
    if (o.authority) {
      s.push(o.authority)
      s.push("@")
    }
    if (o.hostname) {
      s.push(o.hostname)
    }
    if (o.port) {
      s.push(":")
      s.push(o.port)
    }
  }
  if (o.path) {
    s.push(o.path.join("/"))
  }
  if (o.query) {
    s.push("?")
    s.push(o.query)
  }
  if (o.fragment) {
    s.push("#")
    s.push(o.fragment)
  }
  return s.join("")
}
exports.printURI = printURI

function simplify(x) {
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
    y.hostname = x.hostname.replace(/^www\.|\.\w\w$/g, "") // .co.uk
                           .replace(/\.(?:aero|asia|biz|cat|com|co|coop|info|int|jobs|mobi|museum|name|net|org|pro|tel|travel|xxx|edu|gov|mil)$/, "")
                           // TODO: is this needed?
                           .replace(/\.\w\w$/, "") // .ac.edu
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
exports.simplify = simplify