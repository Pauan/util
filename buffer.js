goog.provide("util.buffer")

goog.require("util.log")
goog.require("util.array")

goog.scope(function () {
  var assert = util.log.assert
    , array  = util.array

  util.buffer.loc = function (x, y) {
    return {
      source: (x.source !== null
                ? x.source
                : y.source),
      start: x.start,
      end: y.end
    }
  }

  // TODO inefficient, since it doesn't generate the values lazily
  function toBuffer(a, filename, line, column) {
    return array.map(a, function (s) {
      var start = { line:   line
                  , column: column }

      if (s === "\n") {
        line   = start.line + 1
        column = 0
      } else {
        line   = start.line
        column = start.column + 1
      }

      var end = { line:   line
                , column: column }

      return { value: s
             , loc: { source: filename
                    , start:  start
                    , end:    end } }
    })
  }

  function toIterator(a) {
    var i   = 0
      , len = array.len(a)

    return {
      peek: function () {
        assert(i < len)
        return a[i]
      },
      read: function () {
        assert(i < len)
        ++i
      },
      has: function () {
        return i < len
      }
    }
  }

  // Takes a string and returns a stream that goes through the
  // string 1 character at a time, keeping track of line/column information.
  // This is useful for parsers.
  util.buffer.buffer = function (a, filename) {
    if (filename == null) {
      filename = null
    }
    return toIterator(toBuffer(a, filename, 1, 0))
  }

  util.buffer.Error = function (o, s) {
    var a = [s]
    if (o != null) {
      this.fileName   = o.source
      this.lineNumber = o.start.line
      //this.start      = o.start
      //this.end        = o.end

      var b1 = (o.source !== null)
        , b2 = (o.start.line != null)
        , b3 = (o.start.column != null)

      if (b1 || b2 || b3) {
        array.push(a, "  (")
        if (b1) {
          array.push(a, o.source)
          if (b2) {
            array.push(a, ":")
          }
        }
        if (b2) {
          array.push(a, o.start.line)
          if (b3) {
            array.push(a, ":")
            array.push(a, o.start.column)
          }
        }
        array.push(a, ")")
      }
    }
    // TODO util.error
    // http://stackoverflow.com/a/8460753/449477
    if (typeof Error["captureStackTrace"] === "function") {
      Error["captureStackTrace"](this, this["constructor"]) // TODO test this
    }
    //var err = new Error()
    //err.name = this.name
    //this.stack = err.stack // TODO test this
    this["originalMessage"] = s // TODO
    this["message"] = array.join(a, "")
  }
  util.buffer.Error.prototype = new Error()
  //BufferError.prototype.constructor = BufferError // TODO is this needed?
  util.buffer.Error.prototype["name"] = "Error"
})
