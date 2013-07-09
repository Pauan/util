define(["./iter"], function (iter) {
  "use strict";

  function line(x) {
    var r    = []
      , s    = x.input
      , iLen = s.length
    while (x.index < iLen) {
      var c = s[x.index]
      r.push(c)
      ++x.index
      if (c === "\n") {
        break
      }
    }
    return r
  }

  // Buffers a string by line and keeps track of line and column information
  // This is useful for error messages
  // Can also be used as iterator that moves through the string one character at a time
  function Buffer(s, filename) {
    if (filename == null) {
      filename = null
    }
    this.input = s
    this.filename = filename
    // TODO uint32 for these ?
    this.column = 0
    this.line = 1
    this.index = 0
    this.text = line(this)
  }
  Buffer.prototype.loc = function (start, end) {
    return {
      source: this.filename,
      start: start,
      end: end
    }
  }
  Buffer.prototype.position = function () {
    return {
      column: this.column,
      line: this.line,
      text: this.text.join("")
    }
  }
  Buffer.prototype.has = function () {
    return this.index < this.input.length || this.column < this.text.length
  }
  Buffer.prototype.peek = function () {
    if (!this.has()) {
      throw new iter.StopIteration()
    }
    return this.text[this.column]
  }
  Buffer.prototype.read = function () {
    var old = this.peek()
    ++this.column
    if (this.column >= this.text.length) {
      this.text = line(this)
      this.column = 0
      ++this.line
    }
    return old
  }
  Buffer.prototype[iter.iterator] = function () {
    return this
  }
  Buffer.prototype.next = Buffer.prototype.read

  // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
  function BufferError(o, s) {
    var a = [s]
    // tests that `o` is an object
    if (Object(o) === o) {
      if (o.start != null) {
        var b1 = (o.start.text != null)
          , b2 = (o.start.line != null)
          , b3 = (o.start.column != null)
        if (b1 || b2 || b3) {
          var iOffset = 0
          a.push("\n")
          if (b1) {
            a.push("  ", o.start.text.replace(/^( +)|\n$/g, function (_, s1) {
              if (s1) {
                iOffset = s1.length
              }
              return ""
            }))
          }
          if (b2 || b3) {
            a.push("  (")
            if (b2) {
              a.push("line ", o.start.line)
            }
            if (b2 && b3) {
              a.push(", ")
            }
            if (b3) {
              a.push("column ", o.start.column + 1)
            }
            a.push(")")
          }
          if (b1 && b3) {
            var end = (o.end.line > o.start.line
                        ? o.start.text.length - 1
                        : o.end.column)
            a.push("\n ", new Array((o.start.column + 1) - iOffset + 1).join(" "),
                          new Array((end - o.start.column) + 1).join("^"))
          }
        }
      }
      this.start      = o.start
      this.end        = o.end
      this.fileName   = o.source
      this.lineNumber = o.start.line
    }
    var err = new Error()
    err.name = this.name
    this.stack = err.stack // TODO test this
    this.originalMessage = s
    this.message = a.join("")
  }
  BufferError.prototype = new Error()
  //BufferError.prototype.constructor = BufferError // TODO is this needed?
  BufferError.prototype.name = "buffer.Error"

  return Object.freeze({
    Buffer: Buffer,
    Error: BufferError,
  })
})
