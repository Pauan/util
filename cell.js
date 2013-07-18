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
      }/*,
      unbind: function (f) {
        var i = events.indexOf(f)
        if (i !== -1) {
          events.splice(i, 1)
          if (events.length === 0) {

          }
        }
      }*/
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

  function call(a, f) {
    return f.apply(null, a.map(function (x) {
      return x.get()
    }))
  }

  // Takes an array of signals and a function; returns a signal
  // When any of the signals change, the function is called with the value of the signals
  function maps(a, f) {
    var o = value(call(a, f))
    a.forEach(function (x) {
      x.bind(function () {
        o.set(call(a, f))
      })
    })
    return o
  }

  // Takes a signal and function; returns a signal
  // Maps the function over the input signal
  function map(x, f) {
    return maps([x], f)
    /*return fold(f(x.get()), x, function (l, r) {
      return f(r)
    })*/
  }

  // Takes a signal; returns a signal
  // Consecutive duplicates are ignored
  // e.g. (1 -> 1 -> 2 -> 1 -> 1 -> 3 -> 3) is treated as
  //      (1 -> 2 -> 1 -> 3)
  // TODO is there a better way to implement this?
  function dedupe(x) {
    var o = value(x.get())
    x.bind(function (x) {
      if (object.isnt(o.get(), x)) {
        o.set(x)
      }
    })
    return o
  }

  // Takes an integer; returns a signal
  // Updates the signal ASAP, but not faster than the input integer (in FPS)
  // http://www.sitepoint.com/creating-accurate-timers-in-javascript/
  // TODO is there a better implementation for this?
  function fps(i) {
    i = 1000 / i
    var start = Date.now()
      , count = 0
      , o     = value(0)
    setTimeout(function anon() {
      ++count

      var diff = (Date.now() - start) - (count * i)
      o.set(diff)

      setTimeout(anon, i - diff)
    }, i)
    return o
  }

  return Object.freeze({
    value: value,
    fold: fold,
    maps: maps,
    map: map,
    dedupe: dedupe,
    fps: fps,
  })
})
