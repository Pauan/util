define(function (require, exports) {
  "use strict";

  var a = require("./cons")
    , b = require("./object")

  var toCons   = a.toCons
    , cons     = a.cons
    , car      = a.car
    , cdr      = a.cdr
    , nil      = a.nil
    , isObject = b.isObject

  function loc(x, y) {
    return {
      source: (x.source !== null
                ? x.source
                : y.source),
      start: x.start,
      end: y.end
    }
  }
  exports.loc = loc

  function buffer1(a, filename, line, column) {
    if (a === nil) {
      return a
    } else {
      var s = car(a)

      var start = { line:   line
                  , column: column }

      var end = (s === "\n"
                  ? { line:   ++line
                    , column: (column = 0) }
                  : { line:   line
                    , column: ++column })

      return cons({ value: s
                  , loc:   { source: filename
                           , start:  start
                           , end:    end } }, function () {
        return buffer1(cdr(a), filename, line, column)
      })
    }
  }

  // Takes a cons (usually a string) and returns a cons that goes through the
  // string 1 character at a time, keeping track of line/column information.
  // This is useful for parsers.
  function buffer(a, filename) {
    if (filename == null) {
      filename = null
    }
    return buffer1(toCons(a), filename, 1, 0)
  }
  exports.buffer = buffer

  function BufferError(o, s) {
    var a = [s]
    if (isObject(o) && o.loc != null) {
      o = o.loc
      this.fileName   = o.source
      this.lineNumber = o.start.line
      //this.start      = o.start
      //this.end        = o.end

      var b1 = (o.source !== null)
        , b2 = (o.start.line != null)
        , b3 = (o.start.column != null)

      if (b1 || b2 || b3) {
        a.push(" (")
        if (b1) {
          a.push(o.source)
          if (b2 || b3) {
            a.push(" ")
          }
        }
        if (b2) {
          a.push(o.start.line)
          if (b3) {
            a.push(":")
          }
        }
        if (b3) {
          a.push(o.start.column)
        }
        a.push(")")
      }
    }
    // http://stackoverflow.com/a/8460753/449477
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor) // TODO test this
    }
    //var err = new Error()
    //err.name = this.name
    //this.stack = err.stack // TODO test this
    this.originalMessage = s
    this.message = a.join("")
  }
  BufferError.prototype = new Error()
  //BufferError.prototype.constructor = BufferError // TODO is this needed?
  BufferError.prototype.name = "Error"
  exports.Error = BufferError
})