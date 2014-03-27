goog.provide("util.url")

goog.require("util.array")
goog.require("util.string")
goog.require("util.re")

goog.scope(function () {
  var array = util.array
    , re    = util.re

	// http://en.wikipedia.org/wiki/URI_scheme#Generic_syntax
	var reUri = /^([a-zA-Z][a-zA-Z0-9\+\.\-]*:)(?:(\/\/)([^\@]+\@)?([^\/\?\#\:]*)(\:[0-9]+)?)?([^\?\#]*?)([^\/\?\#]*)(\?[^\#]*)?(\#.*)?$/

  /**
   * @typedef {{ scheme:    string,
	 *             separator: string,
   *             authority: string,
   *             hostname:  string,
   *             port:      (number|string),
   *             path:      string,
	 *             file:      string,
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
				separator: a[2] || "",
        authority: a[3] || "",
        hostname:  a[4] || "",
        port:      (a[5]
										 ? +a[5]
										 : ""),
        path:      a[6] || "",
				file:      a[7] || "",
        query:     a[8] || "",
        fragment:  a[9] || ""
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
			y.separator = ""
    } else {
      y.scheme = x.scheme
			y.separator = x.separator
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
