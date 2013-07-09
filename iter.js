define(["./name", "./object"], function (name, object) {
  "use strict";

  var iterator = new name.Name()

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

  // TODO: these return arrays, they should return iterators, but can't due to lack of generators
  function allKeys(x) {
    var r = []
    for (var s in x) {
      r.push(s)
    }
    return r
  }

  // TODO these can at least return iterators, even without generators
  function allValues(x) {
    return allKeys(x).map(function (s) {
      return x[s]
    })
  }

  function allItems(x) {
    return allKeys(x).map(function (s) {
      return [s, x[s]]
    })
  }

  // TODO inefficient?
  function keys(x) {
    var has = {}.hasOwnProperty
    return allKeys(x).filter(function (s) {
      return has.call(x, s)
    })
  }

  function values(x) {
    return keys(x).map(function (s) {
      return x[s]
    })
  }

  function items(x) {
    return keys(x).map(function (s) {
      return [s, x[s]]
    })
  }


  // Non-standard but useful stuff
  function peekIterator(x) {
    var current = x.next()
    return {
      peek: function () {
        return current
      },
      next: function () {
        current = x.next()
        return current
      }
    }
  }

  function some(x, f) {
    try {
      if (iterator in x) {
        var o = x[iterator]()
        while (true) {
          if (f(o.next())) {
            return true
          }
        }
      } else if ("length" in x) {
        for (var i = 0; i < (x.length >>> 0); ++i) {
          if (f(x[i])) {
            return true
          }
        }
      } else {
        throw new TypeError(x + " does not have an @iterator or length property")
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

  function map(x, f) {
    var r = []
    each(x, function (x) {
      r.push(f(x))
    })
    return r
  }

  function has(x, y) {
    return some(x, function (x) {
      return object.is(x, y)
    })
  }

  function filter(x, f) {
    var r = []
    each(x, function (x) {
      if (f(x)) {
        r.push(x)
      }
    })
    return r
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
    peekIterator: peekIterator,
    some: some,
    every: every,
    each: each, // TODO maybe rename to forEach or forOf or forof ?
    length: length,
    forin: forin,
    map: map,
    has: has,
    filter: filter,
  }
})
