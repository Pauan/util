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

  function value(x) {
    // TODO is this correct ?
    if (!isObject(x)) {
      throw new TypeError(x)
    }
    return x.value
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

  // Non-standard
  function isIter(x) {
    return isObject(x) && (iterator in x || "length" in x)
  }

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
    } else {
      throw TypeError(x)
    }
  }

  function step(x, value) {
    var result = next(x, value)
    if (has(result)) {
      return result
    } else {
      return false
    }
  }

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

  function partitionWhile(a, f) {
    a = toIter(a)

    var o, l = []
    while ((o = step(a))) {
      var x = value(o)
      if (f(x)) {
        l.push(x)
      } else {
        break
      }
    }

    // TODO should this just return the iterator, or should it convert it into an array?
    return [l, a]
  }

  function foldl(x, a, f) {
    a = toIter(a)

    var o
    while ((o = step(a))) {
      x = f(x, value(o))
    }

    return x
  }

  // TODO does this have to be implemented recursively like this...?
  function foldr1(a, x, f) {
    var o = step(a)
    if (o) {
      return f(value(o), foldr1(a, x, f))
    } else {
      return x
    }
  }

  function foldr(a, x, f) {
    a = toIter(a)
    return foldr1(a, x, f)

    // TODO optimization for array-like objects ?
    /*if (isObject(a) && "length" in a) {
      var i = a.length
      while (i--) {
        x = f(a[i], x)
      }
      return x
    }*/
  }

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

  function chunk(iTop, a) {
    a = toIter(a)

    return makeIterator(function () {
      var i = iTop
        , r = []

      while (i--) {
        var o = step(a)
        if (o) {
          r.push(value(o))
        // TODO not quite correct
        } else {
          throw new Error("expected " + iTop + " elements but got " + (iTop - i))
        }
      }

      return result(true, r)
    })
  }

  function range(min, max) {
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

  // TODO doesn't work ?
  function flatten1(a) {
    a = [toIter(a)]

    return makeIterator(function () {
      while (true) {
        if (a.length) {
          var last = a[a.length - 1]
            , o    = step(last)
          var x = value(o)
          if (isIter(x)) {
            a.push(x)
          } else {
            return result(true, x)
          }
        } else {
          return result(false)
        }
      }

      /*var o, r = []
      while ((o = step(a))) {
        var x = value(o)
        if (isIter(x)) {
          x = toIter(x)

          var o2
          while ((o2 = step(x))) {
            r.push(value(o2))
          }

        } else {
          r.push(x)
        }
      }
      return r*/
    })
  }

/*
  iterpose("~", [])           -> []
  iterpose("~", [1])          -> [1]
  iterpose("~", [1, 2])       -> [1, "~", 2]
  iterpose("~", [1, 2, 3])    -> [1, "~", 2, "~", 3]
  iterpose("~", [1, 2, 3, 4]) -> [1, "~", 2, "~", 3, "~", 4]
*/
  function interpose(s, a) {
    a = toIter(a)

    var first = true
      , o     = false

    return makeIterator(function () {
      if (!o) {
        o = step(a)
      }
      if (o) {
        if (first) {
          first = false
          o     = false
          return result(true, value(o))
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

  function zip1(a, fail) {
    a = [].map.call(a, function (x) {
      return toIter(x)
    })

    if (a.length) {
      return makeIterator(function () {
        var every = true
          , some  = false

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

  function zipMax() {
    return zip1(arguments, function (o) {
      return result(true, o)
    })
  }

  function zip() {
    return zip1(arguments, function () {
      throw new Error("arguments must be the same length; perhaps you want to use zipMin or zipMax?")
    })
  }

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
      //x = toArray(x)

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


  // Misc stuff
  
  function join() {
    return flatten1([].slice.call(arguments))
  }

  // TODO: eager, but can't make lazy due to lack of generators
  // TODO returns an array, not an iterator
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
    toArray: toArray,
    map: map,
    foldl: foldl,
    foldr: foldr,
    flatten1: flatten1,
    zip: zip,
    zipMin: zipMin,
    zipMax: zipMax,
    product: product,
  }
})