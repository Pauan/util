goog.provide("util.url")

goog.require("util.array")
goog.require("util.string")
goog.require("util.re")

goog.scope(function () {
  var array = util.array
    , re    = util.re

	// http://en.wikipedia.org/wiki/URI_scheme#Generic_syntax
	var reUri = /^([a-zA-Z][a-zA-Z0-9\+\.\-]*:)(?:(\/\/(?:[^\@]+\@)?)([^\/\?\#\:]*)(\:[0-9]+)?)?([^\?\#]*?)([^\/\?\#]*)(\?[^\#]*)?(\#.*)?$/

  /**
   * @typedef {{ scheme:    string,
   *             authority: string,
   *             hostname:  string,
   *             port:      (number|string),
   *             path:      string,
   *             query:     string,
   *             fragment:  string }}
   */
  var uriObject

  /**
   * @param {string} s
   * @return {!uriObject}
   */
  util.url.parseURI = function (s) {
    var a = re.exec(s, reUri)
    if (a) {
      return {
        scheme:    util.string.lower(a[1]),
        authority: a[2] || "",
        hostname:  a[3] || "",
        port:      (a[4]
										 ? +a[4]
										 : ""),
        path:      a[5] || "",
				file:      a[6] || "",
        query:     a[7] || "",
        fragment:  a[8] || ""
      }
    } else {
      throw new Error("invalid URI: " + s)
    }
  }

  /**
   * @param {!uriObject} x
   * @return {!uriObject}
   */
  util.url.simplify = function (x) {
    var y = {}

		if (x.scheme === "http:" || x.scheme === "https:") {
      y.scheme = ""
    } else {
      y.scheme = x.scheme
    }

		y.authority = x.authority
		// http://en.wikipedia.org/wiki/List_of_Internet_top-level_domains
		y.hostname = re.replace(re.replace(re.replace(x.hostname, /^www\.|\.\w\w$/g, ""), // .co.uk
		                                                          /\.(?:aero|asia|biz|cat|com|co|coop|info|int|jobs|mobi|museum|name|net|org|pro|tel|travel|xxx|edu|gov|mil)$/, ""),
		                                                          // TODO: is this needed?
		                                                          /\.\w\w$/, "") // .ac.edu
		y.port     = x.port
		y.path     = x.path
		y.file     = x.file
		y.query    = x.query
		y.fragment = x.fragment
    return y
  }
})
