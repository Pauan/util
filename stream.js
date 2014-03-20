goog.provide("util.stream")

goog.require("util.array")
goog.require("util.log")

goog.scope(function () {
  var array  = util.array
    , assert = util.log.assert

  util.stream.end = {}

  var sentinel = {}

  util.stream.make = function (f) {
    var old = sentinel

    return {
      peek: function () {
        assert(old !== sentinel)
        return old
      },
      read: function () {
        assert(old !== sentinel)
        old = f()
      },
      has: function () {
        if (old === sentinel) {
          old = f()
        }
        return old !== util.stream.end
      }
    }
  }

  util.stream.toArray = function (a) {
    var r = []
    while (a.has()) {
      array.push(r, a.peek())
      a.read()
    }
    return r
  }

  util.stream.fromArray = function (a) {
    var i   = 0
      , len = array.len(a)

    return util.stream.make(function () {
      if (i < len) {
        return a[i++]
      } else {
        return util.stream.end
      }
    })
  }
})
