define(function (require, exports) {
  "use strict";

  var object = require("./object")

  var isObject = object.isObject
    , isString = object.isString
    , isNumber = object.isNumber

  // Lazy cons implementation; slightly slower than iterators (in comparable situations), but:
  //
  //  * Functional, can iterate over the same cons cell multiple times
  //
  //  * Naturally supports peeking; great for file streams
  //
  //  * The cdr of the cons is lazy, but the car is NOT lazy
  //
  //  * Can easily convert to/from iterators, with a bit of extra overhead, while retaining laziness
  //
  //  * Much easier implementation than iterators
  //
  //  * Simpler and more consistent (no difference between an "iterable" and an "iterator")
  //
  function Nil() {}

  // Return this in the cdr to mean "list is done"
  var nil = new Nil()
  exports.nil = nil

  function Cons(x, y) {
    this.car = x
    this.cdr = y
  }
  Cons.prototype = nil

  function cons(x, y) {
    if (typeof y !== "function") {
      throw new TypeError(y)
    }
    return new Cons(x, y)
  }
  exports.cons = cons

  function car(x) {
    if (!(x instanceof Cons)) {
      throw new TypeError(x)
    }
    return x.car
  }
  exports.car = car

  function cdr(x) {
    if (!(x instanceof Cons)) {
      throw new TypeError(x)
    }
    if (!x.cached) {
      x.cached = true
      x.cdr = x.cdr()
    }
    return x.cdr
  }
  exports.cdr = cdr


  function arrayToCons(a) {
    var i = 0
    return (function anon() {
      if (i < a.length) {
        return cons(a[i++], anon)
      } else {
        return null
      }
    })()
  }

  function isCons(x) {
    return x instanceof Nil || (isObject(x) && "length" in x)
  }
  exports.isCons = isCons

  function toCons(x) {
    if (x instanceof Nil) {
      return x
    } else if (isObject(x) && "length" in x) {
      return arrayToCons(x)
    } else {
      throw new Error("can't convert to cons: " + x)
    }
  }
  exports.toCons = toCons

  function toArray(x) {
    if (Array.isArray(x)) {
      return x
    } else if (x instanceof Nil) {
      var r = []
      while (x !== nil) {
        r.push(car(x))
        x = cdr(x)
      }
      return r
    } else if (isObject(x) && "length" in x) {
      return [].slice.call(x)
    } else {
      throw new Error("can't convert to array: " + x)
    }
  }
  exports.toArray = toArray

  function len(a) {
    if (isObject(a) && "length" in a) {
      return a.length
    } else if (a instanceof Nil) {
      var i = 0
      while (a !== nil) {
        ++i
        a = cdr(a)
      }
      return i
    } else {
      throw new Error("can't use len: " + a)
    }
  }
  exports.len = len

  function toString(a) {
    if (isString(a)) {
      return a
    } else if (isCons(a)) {
      a = toCons(a)

      var r = []
      while (a !== nil) {
        r.push(toString(car(a)))
        a = cdr(a)
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
      (loop a = (->cons a)
            r = []
        (if (is a nil)
          a
          (recur (cdr a) (push! r (car a)))))))
*/

  var fnApply = (function () {}).apply

  // TODO remove this once ES6 comes out, woohoo spread operator supporting iterators!
  function apply(f, self, a) {
    return fnApply.call(f, self, toArray(a))
  }
  exports.apply = apply

  function some(a, f) {
    a = toCons(a)

    while (a !== nil) {
      if (f(car(a))) {
        return true
      }
      a = cdr(a)
    }

    return false
  }
  exports.some = some

  function partitionWhile(a, f) {
    a = toCons(a)

    var l = []
    while (a !== nil) {
      var x = car(a)
      if (f(x)) {
        l.push(x)
        a = cdr(a)
      } else {
        return [l, a]
      }
    }
    return [l, nil]
  }
  exports.partitionWhile = partitionWhile

  function foldl(x, a, f) {
    a = toCons(a)

    while (a !== nil) {
      x = f(x, car(a))
      a = cdr(a)
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

  function map1(a, f) {
    if (a === nil) {
      return a
    } else {
      return cons(f(car(a)), function () {
        return map1(cdr(a), f)
      })
    }
  }

  function map(a, f) {
    return map1(toCons(a), f)
  }
  exports.map = map

  function filter1(a, f) {
    while (true) {
      if (a === nil) {
        return a
      } else {
        var x = car(a)
        if (f(x)) {
          return cons(x, function () {
            return filter1(cdr(a), f)
          })
        } else {
          a = cdr(a)
        }
      }
    }
  }

  function filter(a, f) {
    return filter1(toCons(a), f)
  }
  exports.filter = filter

  function take1(iTop, a) {
    if (iTop && a !== nil) {
      return cons(car(a), function () {
        return take1(iTop - 1, cdr(a))
      })
    } else {
      return nil
    }
  }

  function take(iTop, a) {
    if (iTop < 0) {
      throw new Error("first argument to take must be greater than or equal to 0")
    }
    return take1(iTop, toCons(a))
  }
  exports.take = take

  function chunk1(iTop, a) {
    var i = iTop
      , r = []
    while (i && a !== nil) {
      --i
      r.push(car(a))
      a = cdr(a)
    }
    if (r.length === iTop) {
      return cons(r, function () {
        return chunk1(iTop, a)
      })
    } else if (r.length === 0) {
      return nil
    } else {
      throw new Error("expected " + iTop + " elements but got " + r.length)
    }
  }

  function chunk(iTop, a) {
    if (iTop < 0) {
      throw new Error("first argument to chunk must be greater than or equal to 0")
    }
    return chunk1(iTop, toCons(a))
  }
  exports.chunk = chunk

  function range1(min, max) {
    if (min < max) {
      return cons(min, function () {
        return range1(min + 1, max)
      })
    } else if (min > max) {
      return cons(min, function () {
        return range1(min - 1, max)
      })
    } else {
      return nil
    }
  }

  function range(min, max) {
    if (!isNumber(min)) {
      throw new Error("first argument to range must be a number")
    }
    if (max == null) {
      max = Infinity
    }
    // TODO error checking for the max number too ?
    return range1(min, max)
  }
  exports.range = range

  function flatten1(a, f) {
    while (a.length) {
      var last = a[a.length - 1]
      if (last === nil) {
        a.pop()
      } else {
        var x = car(last)
        if (isCons(x) && f(a)) {
          a.push(toCons(x))
        } else {
          return cons(x, function () {
            return flatten1(a, f)
          })
        }
      }
    }
    return nil
  }

  function deepFlatten(a) {
    return flatten1([toCons(a)], function () {
      return true
    })
  }
  exports.deepFlatten = deepFlatten

  function flatten(a) {
    return flatten1([toCons(a)], function (a) {
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
  function intersperse1(s, a, first) {
    if (a === nil) {
      return nil
    } else if (first) {
      return cons(car(a), function () {
        return intersperse1(s, cdr(a), false)
      })
    } else {
      return cons(s, function () {
        return intersperse1(s, a, true)
      })
    }
  }

  function intersperse(s, a) {
    return intersperse1(s, toCons(a), true)
  }
  exports.intersperse = intersperse

  function zip2(a, fail) {
    var every = true
      , some  = false

    var r = a.map(function (x) {
      if (x === nil) {
        every = false
        return
      } else {
        some = true
        return car(x)
      }
    })

    if (every) {
      return cons(r, function () {
        return zip2(a.map(function (x) {
          return cdr(x)
        }), fail)
      })
    } else if (some) {
      if (fail === "max") {
        // TODO code duplication
        return cons(r, function () {
          return zip2(a.map(function (x) {
            return cdr(x)
          }), fail)
        })
      } else if (fail === "min") {
        return nil
      } else if (fail === "error") {
        throw new Error("arguments must be the same length; perhaps you want to use zipMin or zipMax?")
      }
      return fail(r)
    } else {
      return nil
    }
  }

  function zip1(a, fail) {
    // TODO inefficient ?
    a = toArray(map(a, function (x) {
      return toCons(x)
    }))

    if (a.length) {
      return zip2(a, fail)
    } else {
      return nil
    }
  }

  function zipMin() {
    return zip1(arguments, "min")
  }
  exports.zipMin = zipMin

  function zipMax() {
    return zip1(arguments, "max")
  }
  exports.zipMax = zipMax

  function unzip(a) {
    return zip1(a, "error")
  }
  exports.unzip = unzip

  function zip() {
    return unzip(arguments)
  }
  exports.zip = zip

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

  // TODO since we now use conses rather than iterators, we can implement this in a lazier way that won't compute the inputs until they're needed
  function product1(a, indices, done, first) {
    if (done) {
      return nil
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
            return nil
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

      return cons(r, function () {
        return product1(a, indices, done, first)
      })
    }
  }

  function product() {
    var first = true
      , done  = false

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

    return product1(a, indices, done, first)
  }
  exports.product = product

  function nOf1(i, x) {
    if (i) {
      // TODO can probably be implemented with --i ?
      return cons(x, function () {
        return nOf1(i - 1, x)
      })
    } else {
      return nil
    }
  }

  function nOf(i, x) {
    if (i < 0) {
      throw new Error("first argument to nOf must be greater than or equal to 0")
    }
    return nOf1(i, x)
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
    // TODO returns an array, not a lazy cons
    return r
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