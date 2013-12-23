define(["./key", "./object"], function (key, object) {
  "use strict";
  
  // Standard stuff
  var iterator = key.Key("iterator")

  // TODO: eager, but can't make lazy due to lack of generators
  function allKeys(x) {
    var r = []
    for (var s in x) {
      r.push(s)
    }
    return toIterator(r)
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
    if (iterator in x) {
      return x[iterator]()
    // TODO ew
    } else if ("length" in x) {
      // TODO ew
      return Array.prototype[iterator].call(x)
    } else {
      throw new TypeError(x + " does not have an @@iterator or length property")
    }
  }

  // TODO codepoints
  String.prototype[iterator] = function () {
    return toIterator(this.split(""))
  }

  Array.prototype[iterator] = function () {
    var x = this
      , i = 0
    return {
      next: function () {
        if (i < (x.length >>> 0)) {
          return { value: x[i++] }
        } else {
          return { done: true }
        }
      }
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

  // TODO strict evaluation, but should be lazy
  function some(x, f) {
    x = toIterator(x)
    while (true) {
      var o = x.next()
      if (o.done) {
        return false
      } else if (f(o.value)) {
        return true
      }
    }
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
      var o = x.next()
      if (o.done) {
        return { done: true }
      } else {
        return { value: f(o.value) }
      }
    })
  }

  function filter(x, f) {
    x = toIterator(x)
    return makeIterator(function () {
      while (true) {
        var o = x.next()
        if (o.done) {
          return { done: true }
        } else if (f(o.value)) {
          return { value: o.value }
        }
      }
    })
  }

  function pair(x) {
    x = toIterator(x)
    return makeIterator(function () {
      var l = x.next()
      if (l.done) {
        return { done: true }
      } else {
        var r = x.next()
        return { value: [l.value, r.value] }
      }
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
        return { value: min++ }
      } else if (min > max) {
        return { value: min-- }
      } else {
        return { done: true }
      }
    })
  }
  
  // TODO
  /*
  function zip() {
    var a = [].map.call(arguments, function (x) {
      return toIterator(x)
    })
    return makeIterator(function () {
      return a.map(function (x) {
        return x.next()
      })
    })
  }*/

  return {
    iterator: iterator,
    //isGenerator: isGenerator,

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
    //zip: zip,
  }
})