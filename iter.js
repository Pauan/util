define(["./object"], function (object) {
  "use strict";

  // Axioms

  var stop = {}

  //var fnApply = (function () {}).apply

  // TODO: eager, but can't make lazy due to lack of generators
  // TODO returns an array, not an iterator
  function allKeys(x) {
    var r = []
    for (var s in x) {
      r.push(s)
    }
    return r
  }
/*
  function apply(f, self, a) {
    return fnApply.call(f, self, a)
  }*/

  function some(a, f) {
    try {
      for (var i = 0; i < a.length; ++i) {
        if (f(a[i])) {
          return true
        }
      }
    } catch (e) {
      if (e !== stop) {
        throw e
      }
    }
    return false
  }

  function partitionWhile(a, f) {
    var l = []
    try {
      for (var i = 0; i < a.length; ++i) {
        var x = a[i]
        if (f(x)) {
          l.push(x)
        } else {
          return [l, [].slice.call(a, i)]
        }
      }
    } catch (e) {
      if (e !== stop) {
        throw e
      }
    }
    return [l, []]
  }

  function foldl(x, a, f) {
    try {
      for (var i = 0; i < a.length; ++i) {
        x = f(x, a[i])
      }
    } catch (e) {
      if (e !== stop) {
        throw e
      }
    }
    return x
  }

  // TODO does this have to be implemented recursively like this...?
  function foldr1(i, a, x, f) {
    if (i < a.length) {
      return f(a[i], foldr1(i + 1, a, x, f))
    } else {
      return x
    }
  }

  // TODO should be cancelable with throwing stop
  function foldr(a, x, f) {
    return foldr1(0, a, x, f)
  }

  function map(a, f) {
    var r = []
    try {
      for (var i = 0; i < a.length; ++i) {
        r.push(f(a[i]))
      }
    } catch (e) {
      if (e !== stop) {
        throw e
      }
    }
    return r
  }

  function filter(a, f) {
    var r = []
    try {
      for (var i = 0; i < a.length; ++i) {
        var x = a[i]
        if (f(x)) {
          r.push(x)
        }
      }
    } catch (e) {
      if (e !== stop) {
        throw e
      }
    }
    return r
  }

  function pair(a) {
    var r = []
    if (a.length % 2 !== 0) {
      throw new Error("expected an even number of elements but got " + a.length)
    }
    for (var i = 0; i < a.length; i += 2) {
      r.push([a[i], a[i + 1]])
    }
    return r
  }

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


  // Derived

  // TODO inefficient ?
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#Example.3A_Flatten_an_array_of_arrays
  function flatten(x) {
    return foldl([], x, function (x, y) {
      // TODO alternative to concat
      return x.concat(y)
    })
  }

  // TODO probably inefficient
  // http://stackoverflow.com/a/12628791/449477
  // http://stackoverflow.com/a/5860190/449477
  function product() {
    return foldl([[]], arguments, function (x, y) {
      return flatten(map(x, function (x) {
        return map(y, function (y) {
          // TODO alternative to concat
          return x.concat([y])
        })
      }))
    })
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

  function join(s, x) {
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

  function len(x) {
    return x.length
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
/*
  function forin(x, f) {
    each(entries(x), function (a) {
      f(a[0], a[1])
    })
  }*/
/*
  function has(x, y) {
    return some(x, function (x) {
      return object.is(x, y)
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
    stop: stop,
    partitionWhile: partitionWhile,
    keys: keys,
    values: values,
    entries: entries,
    allKeys: allKeys,
    allValues: allValues,
    allEntries: allEntries,
    each: each,
    some: some,
    every: every,
    len: len,
    foldl: foldl,
    foldr: foldr,
    join: join,
    map: map,
    filter: filter,
    pair: pair,
    product: product,
    flatten: flatten,
  }
})