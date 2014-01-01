define(["./key", "./object"], function (key, object) {
  "use strict";

  var isObject  = object.isObject
    , isBoolean = object.isBoolean
  
  var iterator = key.Key("@@iterator")
  
  function makeIterator(f) {
    var o = {}
    o[iterator] = function () {
      return this
    }
    o.next = f
    return o
  }

  function arrayToIterator(a) {
    var i = 0
    return {
      next: function () {
        // TODO non-standard, but probably better
        if (i < a.length) {
          return result(true, a[i++])
        } else {
          return result(false)
        }
      }
    }
  }


  // Standard ES6 methods, but without the Iterator prefix

  function next(x, v) {
    var o = x.next(v)
    // TODO is this correct ?
    if (!isObject(o)) {
      throw TypeError(o)
    }
    return o
  }
  
  // Order of arguments is swapped, for convenience
  // Also, the first argument says whether it has a value or not, not whether it's done or not
  function result(has, value) {
    // TODO is this correct ?
    if (!isBoolean(has)) {
      throw TypeError(has)
    }
    return { done: !has, value: value }
  }

  // Non-standard, because it supports array-like objects, but I prefer that for convenience
  // Once iterators become more common, support for array-like objects can be easily removed
  function get(x) {
    if (isObject(x)) {
      if (iterator in x) {
        var o = x[iterator]()
        // TODO is this correct ?
        if (!isObject(o)) {
          throw TypeError(o)
        }
        return o
      } else if ("length" in x) {
        return arrayToIterator(x)
      } else {
        throw TypeError(x)
      }
    } else {
      throw TypeError(x)
    }
  }

  function isStream(x) {
    return x instanceof Stream// || has(x, toStream)
  }

  function stream(x, y) {
    return new Stream(x, y)
  }

  function value(x) {
    return toStream1(x).value
  }

  function next(x) {
    x = toStream1(x)
    if (!("cached" in x)) {
      x.cached = x.next()
    }
    return x.cached
  }

  //var fnApply = (function () {}).apply
/*
  function apply(f, self, a) {
    return fnApply.call(f, self, a)
  }*/

  // Converters
  // TODO could probably be made more efficient, with a fold or something ?
  function arrayToStream(a, i) {
    if (i < a.length) {
      return stream(a[i], function () {
        return arrayToStream(a, i + 1)
      })
    } else {
      return null // TODO is null a good sentinel for empty-stream ?
    }
  }

  function toStream(a) {
    if (isStream(a)) {
      return a
    } else if (has(a, "length")) {
      return arrayToStream(a, 0)
    } else {
      throw new Error("cannot convert " + a + " to stream")
    }
  }

  function toArray(a) {
    if (isStream(a)) {
      var r = []
      do {
        r.push(value(a))
        a = next(a)
      } while (isStream(a))
      return r
    } else if (Array.isArray(a)) {
      return a
    } else if (has(a, "length")) {
      return [].slice.call(a)
    } else {
      throw new Error("cannot convert " + a + " to array")
    }
  }


  // Functions that work on both streams and array-likes
  function some(a, f) {
    if (isStream(a)) {
      do {
        if (f(value(a))) {
          return true
        } else {
          a = next(a)
        }
      } while (isStream(a))

    } else if (has(a, "length")) {
      for (var i = 0; i < a.length; ++i) {
        if (f(a[i])) {
          return true
        }
      }

    } else {
      throw new Error("not iterable: " + a)
    }

    return false
  }

  function partitionWhile(a, f) {
    var l = []

    if (isStream(a)) {
      // TODO returns an array, not a stream
      do {
        var x = value(a)
        if (f(x)) {
          l.push(x)
          a = next(a)
        } else {
          break
        }
      } while (isStream(a))
      return [l, a]

    } else if (has(a, "length")) {
      for (var i = 0; i < a.length; ++i) {
        var x = a[i]
        if (f(x)) {
          l.push(x)
        } else {
          return [l, [].slice.call(a, i)]
        }
      }
      return [l, []]

    } else {
      throw new Error("not iterable: " + a)
    }
  }

  function foldl(x, a, f) {
    if (isStream(a)) {
      do {
        x = f(x, value(a))
        a = next(a)
      } while (isStream(a))

    } else if (has(a, "length")) {
      for (var i = 0; i < a.length; ++i) {
        x = f(x, a[i])
      }

    } else {
      throw new Error("not iterable: " + a)
    }

    return x
  }

  // TODO does this have to be implemented recursively like this...?
  function stream_foldr(a, x, f) {
    if (isStream(a)) {
      return f(value(a), stream_foldr(next(a), x, f))
    } else {
      return x
    }
  }

  function foldr(a, x, f) {
    if (isStream(a)) {
      return stream_foldr(a, x, f)

    } else if (has(a, "length")) {
      var i = a.length
      while (i--) {
        x = f(a[i], x)
      }
      return x

    } else {
      throw new Error("not iterable: " + a)
    }
  }

  function stream_map(a, f) {
    if (isStream(a)) {
      return stream(f(value(a)), function () {
        return stream_map(next(a), f)
      })
    } else {
      return a
    }
  }

  function map(a, f) {
    if (isStream(a)) {
      return stream_map(a, f)

    } else if (has(a, "length")) {
      var r = []
      for (var i = 0; i < a.length; ++i) {
        r.push(f(a[i]))
      }
      return r

    } else {
      throw new Error("not iterable: " + a)
    }

    /*return foldr(a, null, function (x, y) {
      return stream(f(x), function () {
        return y
      })
    })*/

    /*return foldl([], a, function (x, y) {
      x.push(f(y))
      return x
    })*/
  }

  function stream_filter(a, f) {
    while (true) {
      if (isStream(a)) {
        var x = value(a)
        if (f(x)) {
          return stream(x, function () {
            return stream_filter(next(a), f)
          })
        } else {
          a = next(a)
        }
      } else {
        return a
      }
    }
  }

  function filter(a, f) {
    if (isStream(a)) {
      return stream_filter(a, f)

    } else if (has(a, "length")) {
      var r = []
      for (var i = 0; i < a.length; ++i) {
        var x = a[i]
        if (f(x)) {
          r.push(x)
        }
      }
      return r

    } else {
      throw new Error("not iterable: " + a)
    }

    /*return foldr(a, null, function (x, y) {
      if (f(x)) {
        return stream(x, function () {
          return y
        })
      } else {
        return y
      }
    })*/

    /*return foldl([], a, function (x, y) {
      if (f(y)) {
        x.push(y)
      }
      return x
    })*/
  }
/*
  function chunk(iTop, a) {
    if (isStream(a)) {
      var r = []
        , i = iTop
      while (i--) {
        if (isStream(a)) {
          r.push(value(a))
          a = next(a)
        } else {
          throw new Error("expected " + i + " elements but got " + (i - i2))
        }
      }
      return stream(r, function () {
        return chunk(iTop, a)
      })
    } else {
      return a
    }
  }*/

/*
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
  }*/

/*
  (def flatten1 -> a
    (if (stream? a)
      (let x = (value a)
        (if (stream? x)
          (stream (value x)
            (let n = (next x)
              (if (stream? n)
                (flatten1:stream n (next a))
                (flatten1:next a))))
          (stream x (flatten1:next a))))
      a))

  (def join (args)
    (if (isa args 'cons)
        (let a (car args)
          (if (no a)
              (join (cdr args))
              (cons (car a) (join (cons (cdr a) (cdr args))))))
        args))
*/
  // TODO inefficient ?
  function stream_flatten1(a) {
    if (isStream(a)) {
      var x = value(a)
      if (isStream(x)) {
        return stream(value(x), function () {
          var n = next(x)
          if (isStream(n)) {
            return stream_flatten1(stream(n, function () {
              return next(a)
            }))
          } else {
            return stream_flatten1(next(a))
          }
        })
      } else {
        return stream(x, function () {
          return stream_flatten1(next(a))
        })
      }
    } else {
      return a
    }
  }

  function array_flatten1(a) {
    var r = []

    for (var i = 0; i < a.length; ++i) {
      var x = a[i]

      if (isStream(x)) {
        do {
          r.push(value(x))
          x = next(x)
        } while (isStream(x))

      } else if (has(x, "length")) {
        for (var i2 = 0; i2 < x.length; ++i2) {
          r.push(x[i2])
        }

      } else {
        r.push(x)
      }
    }

    return r
  }

  function flatten1(a) {
    if (isStream(a)) {
      return stream_flatten1(a)
    } else if (has(a, "length")) {
      return array_flatten1(a)
    } else {
      throw new Error("not iterable: " + a)
    }
  }

  // TODO
  function interpose(s, x) {
    return [].join.call(x, s)
/*
    var initial = true
    return foldl("", x, function (x, y) {
      if (initial) {
        initial = false
        return x + y
      } else {
        return x + s + y
      }
    })*/
  }

/*
  function stream_zip(a) {
    var vals = map(a, function (a) {
      return value(a)
    })
    return stream(vals, function () {
      return stream_zip(map(a, function (a) {
        return next(a)
      }))
    })
  }*/

  // TODO stream_zip version; what about mixed arrays/streams ?
  function array_zip(a, max) {
    var r = []
    for (var i = 0; i < max; ++i) {
      r.push(map(a, function (x) { return x[i] }))
    }
    return r
  }

  function zipMin() {
    if (arguments.length) {
                      // TODO hacky
      var max = foldl(Infinity, arguments, function (x, y) {
        return Math.min(x, len(y))
      })
      return array_zip(arguments, max)
    } else {
      return []
    }
  }

  function zipMax() {
    // TODO is there a better way to find the length of the arguments...?
    var max = foldl(0, arguments, function (x, y) {
      return Math.max(x, len(y))
    })
    return array_zip(arguments, max)
  }

  function zip() {
    if (arguments.length) {
      // TODO hacky
      var max = len(arguments[0])
      // TODO hacky ?
      each(arguments, function (x) {
        var i = len(x)
        if (i !== max) {
          throw new Error("expected length of " + max + " but got " + i)
        }
      })
      return array_zip(arguments, max)
    } else {
      return []
    }
  }

  function len(a) {
    if (isStream(a)) {
      var i = 0
      do {
        ++i
        a = next(a)
      } while (isStream(a))
      return i

    } else if (has(a, "length")) {
      return a.length

    } else {
      throw new Error("not iterable: " + a)
    }
/*
    // TODO how robust is this ?
    // TODO is this actually any faster than just doing the iteration loop ?
    var y = x[iterator]
    if ((y === ArrayIterator  && object.isArray(x)) ||
        (y === StringIterator && object.isString(x))) {
      return x.length
    } else {
      var i = 0
      each(x, function () {
        ++i
      })
      return i
    }*/
  }


  // Stuff derived from the above
  function join() {
    return flatten1([].slice.call(arguments))
  }

  // TODO probably inefficient
  // http://stackoverflow.com/a/12628791/449477
  // http://stackoverflow.com/a/5860190/449477
  // TODO lazy version for streams
  // TODO lazy version for arrays ?
  function product() {
    return foldl([[]], arguments, function (x, y) {
      // TODO does this need to be flatten or can it be flatten1? is it necessary? can it be removed?
      return flatten(map(x, function (x) {
        return map(y, function (y) {
          // TODO can this be replaced with x.push(y) ?
          return join(x, [y])
        })
      }))
    })
  }


  // Misc stuff
  // TODO: eager, but can't make lazy due to lack of generators
  // TODO returns an array, not a stream
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

  function allEntries(x) {
    return map(allKeys(x), function (s) {
      return [s, x[s]]
    })
  }

  // TODO inefficient?
  function keys(x) {
    return filter(allKeys(x), function (s) {
      return {}.hasOwnProperty.call(x, s)
    })
  }

  function values(x) {
    return map(keys(x), function (s) {
      return x[s]
    })
  }

  function entries(x) {
    return map(keys(x), function (s) {
      return [s, x[s]]
    })
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
/*
  function forin(x, f) {
    each(entries(x), function (a) {
      f(a[0], a[1])
    })
  }*/

/*
  // TODO WeakMap or Set or something ?
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
  }*/

  return {
    foldl: foldl,
    foldr: foldr,
    flatten1: flatten1,
    zip: zip,
    zipMin: zipMin,
    zipMax: zipMax,
  }
})