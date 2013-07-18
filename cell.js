// Extremely light-weight Functional Reactive Programming implementation
// Everything is handled synchronously: no concurrency or parallelism
define(["./object"], function (object) {
  "use strict";

  // Reifies a JavaScript value as a signal
  // use the get method to get the current value
  // use the set method to set the current value
  function value(x) {
    var events = []
    return {
      get: function () {
        return x
      },
      set: function (v) {
        x = v
        events.forEach(function (f) {
          f(x)
        })
      },
      // TODO binds duplicates if called multiple times; is this a problem?
      bind: function (f) {
        events.push(f)
      },
      unbind: function (f) {
        var i = events.indexOf(f)
        if (i !== -1) {
          events.splice(i, 1)
          if (events.length === 0) {

          }
        }
      }
    }
  }

  // Takes an initial JavaScript value, a signal, and a function; returns a signal
  // When the input signal changes, it will call the input function with the previous
  // value and the current value of the input signal
  function fold(init, x, f) {
    var o = value(init)
    x.bind(function (x) {
      o.set((init = f(init, x)))
    })
    return o
  }

  // Takes a signal and function; returns a signal
  // Maps the function over the input signal
  function map(x, f) {
    return fold(f(x.get()), x, function (l, r) {
      return f(r)
    })
  }

  // Takes a signal; returns a signal
  // Consecutive duplicates are ignored
  // e.g. (1 -> 1 -> 2 -> 1 -> 1 -> 3 -> 3) is treated as
  //      (1 -> 2 -> 1 -> 3)
  // TODO is there a better way to implement this?
  function dedupe(x) {
    var o = value(x.get())
    map(x, function (x) {
      if (object.isnt(o.get(), x)) {
        o.set(x)
      }
    })
    return o
  }

  return Object.freeze({
    value: value,
    fold: fold,
    map: map,
    dedupe: dedupe,
  })
})
