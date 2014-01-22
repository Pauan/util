// Extremely light-weight Functional Reactive Programming implementation
// Event dispatch is handled synchronously: no concurrency or parallelism
// VERY loosely based on Elm (http://elm-lang.org/)
goog.provide("util.cell")

goog.require("util.Symbol")
goog.require("goog.array")

goog.scope(function () {
  var Symbol = util.Symbol
    , array  = goog.array

  var events = Symbol("events")
    , info   = Symbol("info")
    , saved  = Symbol("saved")
    , get    = Symbol("get")

  function call(a, f) {
    return f.apply(null, array.map(a, function (x) {
      return x.get()
    }))
  }

  function bind1(x, f) {
    if (x[events].length === 0 && x[info].bind != null) {
      x[saved] = x[info].bind(x)
    }
    x[events].push(f)
  }

  function unbind1(x, f) {
    var i = array.indexOf(x[events], f)
    if (i !== -1) {
      array.splice(x[events], i, 1)
      if (x[events].length === 0 && x[info].unbind != null) {
        x[info].unbind(x[saved])
      }
    }
  }

  function unbind(a, f) {
    array.forEach(a, function (x) {
      unbind1(x, f)
    })
  }

  function binder(o, a, f) {
    array.forEach(a, function (x) {
      bind1(x, f)
    })
    o.unbind = function () {
      unbind(a, f)
    }
  }

  function set(self, v) {
    self[get] = v
    if (self[info].set != null) {
      self[info].set(self, v)
    }
                  // TODO inefficient, it's here to prevent a bug when unbinding inside the called function
    array.forEach(array.clone(self[events]), function (x) {
      x(v)
    })
  }

  /**
   * @constructor
   */
  function Value(x, obj) {
    if (obj == null) {
      obj = {}
    }
    this[get]    = x
    this[info]   = obj
    this[events] = []
  }
  Value.prototype.get = function () {
    return this[get]
  }
  Value.prototype.set = function (v) {
    set(this, v)
  }

  // TODO code duplication
  /**
   * @constructor
   * @extends {Value}
   */
  function Dedupe(x, obj) {
    Value.call(this, x, obj)
  }
  Dedupe.prototype.get = Value.prototype.get
  /**
   * @override
   */
  Dedupe.prototype.set = function (v) {
    // TODO object.isnt
    if (this[get] !== v) {
      set(this, v)
    }
  }

  // Reifies a JavaScript value as a signal
  // use the get method to get the current value
  // use the set method to set the current value
  util.cell.value = function (x, obj) {
    return new Value(x, obj)
  }

  // Same as value, except it ignores duplicates
  util.cell.dedupe = function (x, obj) {
    return new Dedupe(x, obj)
  }

  // Takes an array of signals and a function
  // When any of the signals change, the function is called with the value of the signals
  util.cell.event = function (a, f) {
    var o = {}
    binder(o, a, function () {
      call(a, f)
    })
    return o
  }

  // Takes an array of signals and a function; returns a signal
  // Initially, and when any of the signals change,
  // the function is called with the value of the signals
  util.cell.bind = function (a, f) {
    var x = call(a, f)
      , o = util.cell.value(x)
    binder(o, a, function () {
      o.set(call(a, f))
    })
    return o
  }

  // TODO remove this ?
  // Takes an initial JavaScript value, a signal, and a function; returns a signal
  // When the input signal changes, it will call the input function with the previous
  // value and the current value of the input signal
  util.cell.fold = function (init, x, f) {
    var o = util.cell.value(init)
    binder(o, [x], function (x) {
      o.set((init = f(init, x)))
    })
    return o
  }

  // Takes a value, signal, and a function; returns a signal
  // The initial value of the returned signal is init
  // The function is called with the signal's value
  // If it returns true, the returned signal is updated
  util.cell.filter = function (init, x, f) {
    var o = util.cell.value(init)
    binder(o, [x], function (x) {
      if (f(x)) {
        o.set(x)
      }
    })
    return o
  }

  // Takes a signal and a function
  // When the signal has a truthy value,
  // the function is called with the value of the signal
  util.cell.when = function (x, f) {
    var y = x.get()
    if (y) {
      f(y)
    } else {
      var o = {}
      binder(o, [x], function (x) {
        if (x) {
          o.unbind() // TODO a little hacky
          f(x)
        }
      })
    }
    //return o
  }

  // Takes a signal and function; returns a signal
  // Maps the function over the input signal
  util.cell.map = function (x, f) {
    return util.cell.bind([x], f)
  }

  // Takes 1 or more signals, returns the logical OR of the values
  util.cell.or = function () {
    return util.cell.bind(arguments, function () {
      return array.some(arguments, function (x) {
        return x
      })
    })
  }

  // Takes 1 or more signals, returns the logical AND of the values
  util.cell.and = function () {
    return util.cell.bind(arguments, function () {
      return array.every(arguments, function (x) {
        return x
      })
    })
  }
})