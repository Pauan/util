// Extremely light-weight Functional Reactive Programming implementation
// Event dispatch is handled synchronously: no concurrency or parallelism
// Loosely based on Elm (http://elm-lang.org/)
define(["./name", "./object"], function (name, object) {
  "use strict";

  var events = new name.Name()
    , info   = new name.Name()
    , saved  = new name.Name()
    , get    = new name.Name()

  //var skip = {}

  function call(a, f) {
    return f.apply(null, a.map(function (x) {
      return x.get()
    }))
  }

  function bind(x, f) {
    if (x[events].length === 0 && x[info].bind != null) {
      x[saved] = x[info].bind(x)
    }
    x[events].push(f)
  }

  function unbind(x, f) {
    var i = x[events].indexOf(f)
    if (i !== -1) {
      x[events].splice(i, 1)
      if (x[events].length === 0 && x[info].unbind != null) {
        x[info].unbind(x[saved])
      }
    }
  }

  // TODO closure
  function binder(o, a, f) {
    for (var i = 0, iLen = a.length; i < iLen; ++i) {
      bind(a[i], f)
    }
    o.unbind = function () {
     for (var i = 0, iLen = a.length; i < iLen; ++i) {
        unbind(a[i], f)
      }
    }
  }

  function Value(x, obj) {
    this[get]    = x
    this[info]   = obj
    this[events] = []
  }
  Value.prototype.get = function () {
    return this[get]
  }
  Value.prototype.set = function (v) {
    this[get] = v
    if (this[info].set != null) {
      this[info].set(this, v)
    }
    this[events].forEach(function (f) {
      f(v)
    })
  }

  // Reifies a JavaScript value as a signal
  // use the get method to get the current value
  // use the set method to set the current value
  function value(x, obj) {
    if (obj == null) {
      obj = {}
    }
    return new Value(x, obj)
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

  // Takes an array of signals and a function
  // When any of the signals change, the function is called with the value of the signals
  function event(a, f) {
    var o = {}
    binder(o, a, function () {
      //try {
        call(a, f)
      /*} catch (e) {
        if (e !== skip) {
          throw e
        }
      }*/
    })
    return o
  }

  // Takes an array of signals and a function; returns a signal
  // Initially, and when any of the signals change,
  // the function is called with the value of the signals
  function lift(a, f) {
    //try {
      var x = call(a, f)
    /*} catch (e) {
      if (e !== skip) {
        throw e
      }
    }*/
    var o = value(x)
    binder(o, a, function () {
      //try {
        o.set(call(a, f))
      /*} catch (e) {
        if (e !== skip) {
          throw e
        }
      }*/
    })
    return o
  }

  // Takes an initial JavaScript value, a signal, and a function; returns a signal
  // When the input signal changes, it will call the input function with the previous
  // value and the current value of the input signal
  function fold(init, x, f) {
    var o = value(init)
    binder(o, [x], function (x) {
      //try {
        o.set((init = f(init, x)))
      /*} catch (e) {
        if (e !== skip) {
          throw e
        }
      }*/
    })
    return o
  }

  // Takes a value, signal, and a function; returns a signal
  // The initial value of the returned signal is init
  // The function is called with the signal's value
  // If it returns true, the returned signal is updated
  function filter(init, x, f) {
    var o = value(init)
    binder(o, [x], function (x) {
      //try {
        if (f(x)) {
          o.set(x)
        }
      /*} catch (e) {
        if (e !== skip) {
          throw e
        }
      }*/
    })
    return o
  }

  // Takes an array of signals and a function
  // When all of the signals have a truthy value,
  // the function is called with the values of the signals
  function when(a, f) {
    lift(a, function () {
      for (var i = 0, iLen = arguments.length; i < iLen; ++i) {
        if (!arguments[i]) {
          return
        }
      }
      //try {
        f.apply(null, arguments)
      /*} catch (e) {
        if (e !== skip) {
          throw e
        }
      }*/
    })
  }

  // Takes one or more signals; returns a signal
  // The returned signal updates whenever any of the input signals update
  // If two signals update at the same time, it updates from left-to-right
  function merge(x) {
    var o = value(x.get())
              // TODO test this
    binder(o, arguments, function (x) {
      o.set(x)
    })
    return o
  }

  // Takes a signal and an integer; returns a signal
  // The returned signal is like the input signal but delayed by input integer milliseconds
  function delay(x, i) {
    var o = value(x.get())
    binder(o, [x], function (x) {
      setTimeout(function () {
        o.set(x)
      }, i)
    })
    return o
  }

  // Takes a signal; returns a signal
  // Consecutive duplicates are ignored
  // e.g. (1 -> 1 -> 2 -> 1 -> 1 -> 3 -> 3) is treated as
  //      (1 -> 2 -> 1 -> 3)
  // TODO is there a better way to implement this?
  function dedupe(x) {
    var old = x.get()
    return filter(old, x, function (x) {
      if (object.isnt(old, x)) {
        old = x
        return true
      }
    })
  }

  // Takes a signal and function; returns a signal
  // Maps the function over the input signal
  function map(x, f) {
    return lift([x], f)
  }

  // Takes two signals; returns a signal
  // When the first signal updates, the returned signal updates with the value of the second signal
  function sample(x, y) {
    return map(x, function () {
      return y.get()
    })
  }

  return Object.freeze({
    value: value,
    fps: fps,
    event: event,
    lift: lift,
    fold: fold,
    filter: filter,
    when: when,
    merge: merge,
    delay: delay,
    dedupe: dedupe,
    map: map,
    sample: sample,
  })
})
