define(function (require, exports) {
  "use strict";

  var key    = require("./key")
    , object = require("./object")

  var isObject  = object.isObject
    , isBoolean = object.isBoolean
    , isString  = object.isString

  var iterator = key.Key("@@iterator")
  exports.iterator = makeIterator

  var makeIterator = function (f) {
    var o = {}
    o[iterator] = function () {
      return this
    }
    o.next = f
    return o
  }
  exports.makeIterator = makeIterator

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

  /*function Stream(x, y) {
    this.value = x
    this.next  = y
  }
  Stream.prototype[iterator] = function () {
    var self = this
    return {
      next: function () {
        if (self == null) {
          return result(false)
        } else {
          var x = value(self)
          self = step(self)
          return result(true, x)
        }
      }
    }
  }

  function stream(x, y) {
    return new Stream(x, y)
  }
  exports.stream = stream

  function toStream1(a) {
    var o = step(a)
    if (o) {
      return stream(value(o), function () {
        return toStream1(a)
      })
    } else {
      return null
    }
  }

  function toStream(a) {
    if (a instanceof Stream) {
      return a
    } else {
      return toStream1(toIter(a))
    }
  }
  exports.toStream = toStream*/


  // Standard internal ES6 methods, but without the Iterator prefix

  function next(x, v) {
    var o = x.next(v)
    // TODO is this correct ?
    if (!isObject(o)) {
      throw TypeError(o)
    }
    return o
  }

  // Returns whether the iterator has a value or not, rather than whether it's done or not
  function has(x) {
    // TODO is this correct ?
    if (!isObject(x)) {
      throw new TypeError(x)
    }
    return !x.done
  }
  exports.has = has

  function value(x) {
    // TODO is this correct ?
    if (!isObject(x)) {
      throw new TypeError(x)
    }
    return x.value
  }
  exports.value = value

  // Order of arguments is swapped, for convenience
  // Also, the first argument says whether it has a value or not, not whether it's done or not
  function result(has, value) {
    // TODO is this correct ?
    if (!isBoolean(has)) {
      throw TypeError(has)
    }
    return { done: !has, value: value }
  }
  exports.result = result

  // Non-standard
  function isIter(x) {
    return (isObject(x) && (iterator in x || "length" in x)) || isString(x)
  }
  exports.isIter = isIter

  // Non-standard, because it supports array-like objects, but I prefer that for convenience
  // Once iterators become more common, support for array-like objects can be easily removed
  function toIter(x) {
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
    } else if (isString(x)) {
      return arrayToIterator(x)
    } else {
      throw TypeError(x)
    }
  }
  exports.toIter = toIter

  function step(x, value) {
    var result = next(x, value)
    if (has(result)) {
      return result
    } else {
      return false
    }
  }
  exports.step = step

  function toArray(a) {
    // Optimization, should remove later ?
    if (Array.isArray(a)) {
      return a
    } else {
      a = toIter(a)

      var o, r = []
      while ((o = step(a))) {
        r.push(value(o))
      }

      return r
    }
  }
  exports.toArray = toArray

  function toString(a) {
    // Optimization, should remove later ?
    if (isString(a)) {
      return a
    } else if (isIter(a)) {
      a = toIter(a)

      var o, r = []
      while ((o = step(a))) {
        r.push(toString(value(o)))
      }

      return r.join("")
    } else {
      return "" + a
    }
  }
  exports.toString = toString

/*
  (def ->array -> a
    (if (array? a)
      a
      (loop a = (->iter a)
            r = []
        (if-let x = (iter/step a)
          (recur a (push! r (iter/value x)))
          r))))
*/

  var fnApply = (function () {}).apply

  // TODO remove this once ES6 comes out, woohoo spread operator supporting iterators!
  function apply(f, self, a) {
    return fnApply.call(f, self, toArray(a))
  }
  exports.apply = apply

  function some(a, f) {
    a = toIter(a)

    var o
    while ((o = step(a))) {
      if (f(value(o))) {
        return true
      }
    }

    return false
  }
  exports.some = some

  function wrap(x, a) {
    var returned = false
    return makeIterator(function () {
      if (returned) {
        return next(a)
      } else {
        returned = true
        return result(true, x)
      }
    })
  }

  function partitionWhile(a, f) {
    a = toIter(a)

    var o, l = []
    while ((o = step(a))) {
      var x = value(o)
      if (f(x)) {
        l.push(x)
      } else {
        // TODO should this just return the iterator, or should it convert it into an array?
        return [l, wrap(x, a)]
      }
    }

    // TODO emptyIterator
    return [l, []]
  }
  exports.partitionWhile = partitionWhile

  function foldl(x, a, f) {
    a = toIter(a)

    var o
    while ((o = step(a))) {
      x = f(x, value(o))
    }

    return x
  }
  exports.foldl = foldl

  function foldr(a, x, f) {
    // Faster than doing it recursively
    // Still gets the same result, because whether doing it recursively or not,
    // you have to hold the entire iterator in memory
    a = toArray(a)

    var i = a.length
    while (i--) {
      x = f(a[i], x)
    }

    return x
  }
  exports.foldr = foldr

  function map(a, f) {
    a = toIter(a)

    return makeIterator(function () {
      var o = step(a)
      if (o) {
        return result(true, f(value(o)))
      } else {
        return result(false)
      }
    })
  }
  exports.map = map

  function filter(a, f) {
    a = toIter(a)

    return makeIterator(function () {
      while (true) {
        var o = step(a)
        if (o) {
          var x = value(o)
          if (f(x)) {
            return result(true, x)
          }
        } else {
          return result(false)
        }
      }
    })
  }
  exports.filter = filter

  function take(iTop, a) {
    a = toIter(a)

    if (iTop < 0) {
      throw new Error("first argument to take must be greater than or equal to 0")
    }

    return makeIterator(function () {
      var o
      if (iTop && (o = step(a))) {
        --iTop
        return result(true, value(o))
      } else {
        return result(false)
      }
    })
  }
  exports.take = take

  function chunk(iTop, a) {
    a = toIter(a)

    if (iTop < 0) {
      throw new Error("first argument to chunk must be greater than or equal to 0")
    }

    return makeIterator(function () {
      var r = toArray(take(iTop, a))
      if (r.length === iTop) {
        return result(true, r)
      } else if (r.length === 0) {
        return result(false)
      } else {
        throw new Error("expected " + iTop + " elements but got " + r.length)
      }
    })
  }
  exports.chunk = chunk

  function range(min, max) {
    // TODO isNumber
    if (typeof min !== "number") {
      throw new Error("first argument to range must be a number")
    }
    if (max == null) {
      max = Infinity
    }
    // TODO error checking for the max number too ?
    return makeIterator(function () {
      if (min < max) {
        return result(true, min++)
      } else if (min > max) {
        return result(true, min--)
      } else {
        return result(false)
      }
    })
  }
  exports.range = range

  function flatten1(a, f) {
    a = [toIter(a)]
    return makeIterator(function () {
      while (a.length) {
        var last = a[a.length - 1]
          , o    = step(last)
        if (o) {
          var x = value(o)
          if (isIter(x) && f(a)) {
            a.push(toIter(x))
          } else {
            return result(true, x)
          }
        } else {
          a.pop()
        }
      }
      return result(false)
    })
  }

  function deepFlatten(a) {
    return flatten1(a, function () {
      return true
    })
  }
  exports.deepFlatten = deepFlatten

  function flatten(a) {
    return flatten1(a, function (a) {
      return a.length === 1
    })
  }
  exports.flatten = flatten

/*
  intersperse("~", [])           -> []
  intersperse("~", [1])          -> [1]
  intersperse("~", [1, 2])       -> [1, "~", 2]
  intersperse("~", [1, 2, 3])    -> [1, "~", 2, "~", 3]
  intersperse("~", [1, 2, 3, 4]) -> [1, "~", 2, "~", 3, "~", 4]
*/
  // TODO I don't like this implementation, is it possible to implement this without looking ahead one element?
  function intersperse(s, a) {
    a = toIter(a)

    var first = true
      , o     = false

    return makeIterator(function () {
      if (!o) {
        o = step(a)
      }
      if (o) {
        if (first) {
          var x = value(o)
          first = false
          o     = false
          return result(true, x)
        } else {
          first = true
          return result(true, s)
        }
      } else {
        return result(false)
      }
    })
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
  exports.intersperse = intersperse

  function zip1(a, fail) {
    // TODO inefficient ?
    a = toArray(map(a, function (x) {
      return toIter(x)
    }))

    if (a.length) {
      return makeIterator(function () {
        var some  = false
          , every = true

        var o = a.map(function (x) {
          var o = step(x)
          if (o) {
            some = true
            return value(o)
          } else {
            every = false
            return
          }
        })

        if (every) {
          return result(true, o)
        } else if (some) {
          return fail(o)
        } else {
          return result(false)
        }
      })
    } else {
      // TODO get rid of this by using `var every = a.length` ?
      // TODO emptyIterator ?
      return makeIterator(function () {
        return result(false)
      })
    }
  }

  function zipMin() {
    return zip1(arguments, function (o) {
      return result(false)
    })
  }
  exports.zipMin = zipMin

  function zipMax() {
    return zip1(arguments, function (o) {
      return result(true, o)
    })
  }
  exports.zipMax = zipMax

  function unzip(a) {
    return zip1(a, function () {
      throw new Error("arguments must be the same length; perhaps you want to use zipMin or zipMax?")
    })
  }
  exports.unzip = unzip

  function zip() {
    return unzip(arguments)
  }
  exports.zip = zip

  function len(a) {
    // TODO optimization that should probably be removed later ?
    if (isObject(a) && "length" in a) {
      return a.length
    } else {
      a = toIter(a)
      var i = 0
      while (step(a)) {
        ++i
      }
      return i
    }
  }
  exports.len = len

/*
              -> []
  []          ->
  [1] [2] [3] -> [1 2 3]
  [1 2 3]     -> [1] [2] [3]

  [1 2 3] [4 5 6] -> [1 4] [1 5] [1 6]
                     [2 4] [2 5] [2 6]
                     [3 4] [3 5] [3 6]

  [1 2] [3 4] [5 6 7] -> [1 3 5] [1 3 6] [1 3 7]
                         [1 4 5] [1 4 6] [1 4 7]
                         [2 3 5] [2 3 6] [2 3 7]
                         [2 4 5] [2 4 6] [2 4 7]
*/
  // Super fast cartesian product that returns its results lazily.
  //
  // Unfortunately, due to the way cartesian product works, it has to loop
  // over the inputs multiple times, so it first converts its inputs into arrays.
  //
  // This means that it uses memory proportional to all its inputs, so passing
  // in a super huge (or infinite) iterator to product won't work.
  //
  // As a general overview of how the function works...
  // The general pattern of a cartesian product looks like this:
  //
  //   [ 0 0 0 ]
  //   [     1 ]
  //   [   1 0 ]
  //   [     1 ]
  //   [ 1 0 0 ]
  //   [     1 ]
  //   [   1 0 ]
  //   [     1 ]
  //
  // To implement product as a (fast) iterator, you just have to realize that when
  // yielding a new element, you only have to increment the index of the right-most
  // array. If the index goes beyond the bounds of the array, you then reset the index
  // to 0 and try again with the array to the left. Repeat this process until you get
  // to the left-most array, which is when you stop yielding.
  function product() {
    var done  = false
      , first = true

    var indices = []

    var a = [].map.call(arguments, function (x) {
      // Initialize the indices, so for 3 arguments, indices will be [0, 0, 0]
      indices.push(0)

      // TODO converts the iterators into arrays, because the algorithm
      //      requires the arguments to be looped through multiple times
      // TODO use streams, instead of arrays? slower, but guaranteed to be lazy (probably still not constant memory, though...)
      x = toArray(x)

      // This is so empty inputs cause the output iterator to also be empty
      if (x.length === 0) {
        done = true
      }
      return x
    })

    return makeIterator(function () {
      if (done) {
        return result(false)
      } else {
        if (first) {
          first = false
          // Handles the case where no arguments are passed in
          if (a.length === 0) {
            done = true
          }
        } else {
          var index = (a.length - 1)
          while (true) {
            ++indices[index]
            if (indices[index] < a[index].length) {
              break
            // TODO move this outside of the while loop for efficiency ?
            } else if (index === 0) {
              done = true
              return result(false)
            } else {
              indices[index] = 0
              --index
            }
          }
        }

        var r = []
        for (var i = 0; i < a.length; ++i) {
          r.push(a[i][indices[i]])
        }

        return result(true, r)
      }
    })
  }
  exports.product = product

  function nOf(i, x) {
    if (i < 0) {
      throw new Error("first argument to nOf must be greater than or equal to 0")
    }

    return makeIterator(function () {
      if (i) {
        --i
        return result(true, x)
      } else {
        return result(false)
      }
    })
  }
  exports.nOf = nOf


  // Misc stuff

  // TODO faster version that returns an array and splices arrays in directly and converts iters to arrays ?
  function join() {
    return flatten([].slice.call(arguments))
  }
  exports.join = join

  // TODO: eager, but can't make lazy due to lack of generators
  function allKeys(x) {
    var r = []
    for (var s in x) {
      r.push(s)
    }
    return toIter(r)
  }
  exports.allKeys = allKeys

  function allValues(x) {
    return map(allKeys(x), function (s) {
      return x[s]
    })
  }
  exports.allValues = allValues

  function allEntries(x) {
    return map(allKeys(x), function (s) {
      return [s, x[s]]
    })
  }
  exports.allEntries = allEntries

  // TODO inefficient?
  function keys(x) {
    return filter(allKeys(x), function (s) {
      return {}.hasOwnProperty.call(x, s)
    })
  }
  exports.keys = keys

  function values(x) {
    return map(keys(x), function (s) {
      return x[s]
    })
  }
  exports.values = values

  function entries(x) {
    return map(keys(x), function (s) {
      return [s, x[s]]
    })
  }
  exports.entries = entries

  function every(x, f) {
    return !some(x, function (x) {
      return !f(x)
    })
  }
  exports.every = every

  function each(x, f) {
    some(x, function (x) {
      f(x)
      return false
    })
  }
  exports.each = each

  function forin(x, f) {
    each(entries(x), function (a) {
      f(a[0], a[1])
    })
  }
  exports.forin = forin

  // TODO WeakMap or WeakSet or something ?
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
  exports.dedupe = dedupe

  function mapzip(x, f) {
    return unzip(map(unzip(x), f))
  }
  exports.mapzip = mapzip
})