define(["./key", "./object"], function (key, object) {
  "use strict";

  var hasOwn = {}.hasOwnProperty

  /*function until(x) {
    var y, r = []
    try {
      while (true) {
        r.push((y = x.next()))
        if (y === "\n") {
          break
        }
      }
    } catch (e) {
      if (!(e instanceof StopIteration)) {
        throw e
      }
    }
    return r.join("")
  }*/

  function toIterator(x) {
    // TODO codepoints
    if (typeof x === "string") {
      return toIterator(x.split(""))
    } else if (iterator in x) {
      return x[iterator]()
    } else if ("length" in x) {
      var i = 0
      return {
        next: function () {
          if (i < (x.length >>> 0)) {
            return x[i++]
          } else {
            throw new StopIteration()
          }
        }
      }
    } else {
      throw new TypeError(x + " does not have an @iterator or length property")
    }
  }

  function makeIterator(f) {
    var o = {}
    o[iterator] = function () {
      return this
    }
    o.next = f
    return o
  }

  // Non-standard but useful stuff

  // Strict evaluation
  function some(x, f) {
    x = toIterator(x)
    try {
      while (true) {
        if (f(x.next())) {
          return true
        }
      }
    } catch (e) {
      if (!(e instanceof StopIteration)) {
        throw e
      }
    }
    return false
  }

  function every(x, f) {
    return !some(x, function (x) {
      return !f(x)
    })
  }

  function each(x, f) {
    some(x, function (x) {
      f(x)
      return false
    })
  }

  function length(x) {
    var i = 0
    each(x, function () {
      ++i
    })
    return i
  }

  function forin(x, f) {
    each(items(x), function (a) {
      f(a[0], a[1])
    })
  }

  function has(x, y) {
    return some(x, function (x) {
      return object.is(x, y)
    })
  }

  // Lazy evaluation
  /*function peek(x) {
    x = toIterator(x)
    var r = makeIterator(function () {
      if (this.stopped) {
        throw new StopIteration()
      } else {
        var old = this.peek
        try {
          this.peek = x.next()
        } catch (e) {
          if (e instanceof StopIteration) {
            this.stopped = true
            delete this.peek
          } else {
            throw e
          }
        }
        return old
      }
    })
    r.next()
    return r
  }

  function buffer(x) {
    x = toIterator(x)
    var r = makeIterator(function () {
      var s = this.text[this.column]
      if (this.column > this.text.length) {
        var y = until(x)
        // TODO: a little bit hacky
        if (y === "") {
          throw new StopIteration()
        } else {
          this.text = y
          this.column = 0
          ++this.line
        }
      } else {
        ++this.column
      }
      return s
    })
    r.text   = until(x)
    r.line   = 1
    r.column = 0
    return r
  }*/

  function map(x, f) {
    x = toIterator(x)
    return makeIterator(function () {
      return f(x.next())
    })
  }

  function filter(x, f) {
    x = toIterator(x)
    return makeIterator(function () {
      while (true) {
        var y = x.next()
        if (f(y)) {
          return y
        }
      }
    })
  }

  function pair(x) {
    x = toIterator(x)
    return makeIterator(function () {
      var l = x.next()
        , r
      try {
        r = x.next()
      } catch (e) {
        if (!(e instanceof StopIteration)) {
          throw e
        }
      }
      return [l, r]
    })
  }

  function dedupe(x) {
    var seen = {}
    return filter(x, function (x) {
      if (seen[x]) {
        return false
      } else {
        seen[x] = true
        return true
      }
    })
  }

  function range(min, max) {
    return makeIterator(function () {
      if (min < max) {
        return min++
      } else if (min > max) {
        return min--
      } else {
        throw new StopIteration()
      }
    })
  }
  
  function zip() {
    var a = [].map.call(arguments, function (x) {
      return toIterator(x)
    })
    return makeIterator(function () {
      return a.map(function (x) {
        return x.next()
      })
    })
  }


  // Standard stuff
  var iterator = new key.Key()

  // TODO: should be a unique [[Class]] but can't
  function StopIteration() {}

  function Iterator(x) {
    // TODO is this spec-compliant?
    if (!(this instanceof Iterator)) {
      return new Iterator(x)
    }
  }
  Iterator.prototype[iterator] = function () {
    return this
  }

  // TODO not quite correct, should use {}.toString.call, but that returns "[object Object]"
  function isStopIteration(x) {
    return x instanceof StopIteration
  }

  // TODO: this returns an array, it should return an iterator, but can't due to lack of generators
  function allKeys(x) {
    var r = []
    for (var s in x) {
      r.push(s)
    }
    return r
  }

  function allValues(x) {
    return map(allKeys(x), function (s) {
      return x[s]
    })
  }

  function allItems(x) {
    return map(allKeys(x), function (s) {
      return [s, x[s]]
    })
  }

  // TODO inefficient?
  function keys(x) {
    return filter(allKeys(x), function (s) {
      return hasOwn.call(x, s)
    })
  }

  function values(x) {
    return map(keys(x), function (s) {
      return x[s]
    })
  }

  function items(x) {
    return map(keys(x), function (s) {
      return [s, x[s]]
    })
  }

  return {
    iterator: iterator,
    Iterator: Iterator,
    StopIteration: StopIteration,
    //isGenerator: isGenerator,
    isStopIteration: isStopIteration,

    keys: keys,
    values: values,
    items: items,
    allKeys: allKeys,
    allValues: allValues,
    allItems: allItems,

    // Non-standard
    //peek: peek,
    toIterator: toIterator,
    each: each, // TODO maybe rename to forOf or forof ?
    some: some,
    every: every,
    length: length,
    forin: forin,
    map: map,
    has: has,
    filter: filter,
    pair: pair,
    dedupe: dedupe,
    range: range,
    zip: zip,
  }
})
