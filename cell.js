// Extremely light-weight Functional Reactive Programming implementation
// Event dispatch is handled synchronously: no concurrency or parallelism
// VERY loosely based on Elm (http://elm-lang.org/)
goog.provide("util.cell")
goog.provide("util.cell.Signal")

goog.require("util.Symbol")
goog.require("util.array")
goog.require("util.func")

goog.scope(function () {
  var Symbol = util.Symbol
    , array  = util.array
    , func   = util.func

  var events = Symbol("events")
    , info   = Symbol("info")
    , saved  = Symbol("saved")
    , get    = Symbol("get")

  /**
   * @param {!util.array.ArrayLike.<!Signal.<T>>} a
   * @param {function(...T):R} f
   * @return {R}
   * @template T, R
   */
  function call(a, f) {
    return func.apply(f, null, array.map(a, function (x) {
      return x.get()
    }))
  }

  /**
   * @param {!Signal.<T>} x
   * @param {function(T):void} f
   * @template T
   */
  function bind1(x, f) {
    if (array.len(x[events]) === 0 && x[info].bind != null) {
      x[saved] = x[info].bind(x)
    }
    array.push(x[events], f)
  }

  /**
   * @param {!Signal.<T>} x
   * @param {function(T):void} f
   * @template T
   */
  function unbind1(x, f) {
    var i = array.indexOf(x[events], f)
    if (i !== -1) {
      array.removeAt(x[events], i)
      if (array.len(x[events]) === 0 && x[info].unbind != null) {
        x[info].unbind(x[saved])
      }
    }
  }

  /**
   * @param {!util.array.ArrayLike.<!Signal.<T>>} a
   * @param {function(T):void} f
   * @template T
   */
  function unbind(a, f) {
    array.each(a, function (x) {
      unbind1(x, f)
    })
  }

  /**
   * @param {R} o
   * @param {!util.array.ArrayLike.<!Signal.<T>>} a
   * @param {function(T):void} f
   * @return {R}
   * @template T, R
   */
  function binder(o, a, f) {
    array.each(a, function (x) {
      bind1(x, f)
    })
    o.unbind = function () {
      unbind(a, f)
    }
    return o
  }

  /**
   * @param {!Signal.<T>} self
   * @param {T} v
   * @template T
   */
  function set(self, v) {
    self[get] = v
    if (self[info].set != null) {
      self[info].set(self, v)
    }
               // TODO inefficient, it's here to prevent a bug when unbinding inside the called function
    array.each(array.copy(self[events]), function (f) {
      f(v)
    })
  }

  /**
   * @typedef {{ set: ((function(!Signal,*):void)|void),
   *             bind: ((function(!Signal):*)|void),
   *             unbind: ((function(*):void)|void) }}
   */
  var type_opt

  /**
   * @param {!Signal.<T>} self
   * @param {T} x
   * @param {!type_opt|void} obj
   * @template T
   */
  function init(self, x, obj) {
    self[info]   = (obj != null ? obj : {})
    self[get]    = x
    self[events] = []
  }

  /**
   * TODO more specific type for the obj parameter, using record type with optional fields
   * @constructor
   * @param {T} x
   * @param {!type_opt=} obj
   * @template T
   */
  function Signal(x, obj) {
    init(this, x, obj)
  }
  /**
   * @return {T}
   */
  Signal.prototype.get = function () {
    return this[get]
  }
  /**
   * TODO @param {T} v
   * @param {*} v
   */
  Signal.prototype.set = function (v) {
    set(this, v)
  }
  util.cell.Signal = Signal

  /**
   * TODO more specific type for the obj parameter, using record type with optional fields
   * TODO code duplication for the type signature with Signal
   * @constructor
   * @extends {Signal.<T>}
   * @param {T} x
   * @param {!type_opt=} obj
   * @template T
   */
  function Dedupe(x, obj) {
    init(this, x, obj)
  }
  Dedupe.prototype.get = Signal.prototype.get
  /**
   * @override
   */
  Dedupe.prototype.set = function (v) {
    // TODO object.isnt
    if (this[get] !== v) {
      set(this, v)
    }
  }

  /**
   * Reifies a JavaScript value as a signal
   * use the get method to get the current value
   * use the set method to set the current value
   *
   * TODO more specific type for the obj parameter, using record type with optional fields
   * TODO code duplication for the type signature with Signal
   * @param {T} x
   * @param {!type_opt=} obj
   * @return {!Signal.<T>}
   * @template T
   */
  util.cell.value = function (x, obj) {
    return new Signal(x, obj)
  }

  /**
   * Same as value, except it ignores duplicates
   *
   * TODO more specific type for the obj parameter, using record type with optional fields
   * TODO code duplication for the type signature with Signal
   * @param {T} x
   * @param {!type_opt=} obj
   * @return {!Dedupe.<T>}
   * @template T
   */
  util.cell.dedupe = function (x, obj) {
    return new Dedupe(x, obj)
  }

  /**
   * Takes an array of signals and a function
   * When any of the signals change, the function is called with the value of the signals
   *
   * @param {!util.array.ArrayLike.<!Signal.<T>>} a
   * @param {function(...T):void} f
   * @return {{ unbind: (function():void|void) }}
   * @template T
   */
  util.cell.event = function (a, f) {
    var o = {}
    return binder(o, a, function () {
      call(a, f)
    })
  }

  /**
   * Takes an array of signals and a function; returns a signal
   * Initially, and when any of the signals change,
   * the function is called with the value of the signals
   *
   * @param {!util.array.ArrayLike.<!Signal.<T>>} a
   * @param {function(...T):*} f
   * @return {!Signal.<T>}
   * @template T
   */
  util.cell.bind = function (a, f) {
    var x = call(a, f)
      , o = util.cell.value(x)
    return binder(o, a, function () {
      o.set(call(a, f))
    })
  }

  /**
   * TODO remove this ?
   * TODO can I do something like @return {!Signal.<T>} ?
   * Takes an initial JavaScript value, a signal, and a function; returns a signal
   * When the input signal changes, it will call the input function with the previous
   * value and the current value of the input signal
   *
   * @param {I} init
   * @param {!Signal.<T>} x
   * @param {function(I, T):I} f
   * @return {!Signal.<I>}
   * @template I, T
   */
  util.cell.fold = function (init, x, f) {
    var o = util.cell.value(init)
    return binder(o, [x], function (x) {
      o.set((init = f(init, x)))
    })
  }

  /**
   * Takes a value, signal, and a function; returns a signal
   * The initial value of the returned signal is init
   * The function is called with the signal's value
   * If it returns true, the returned signal is updated
   *
   * @param {T} init
   * @param {!Signal.<T>} x
   * @param {function(T):boolean} f
   * @return {!Signal.<T>}
   * @template T
   */
  util.cell.filter = function (init, x, f) {
    var o = util.cell.value(init)
    return binder(o, [x], function (x) {
      if (f(x)) {
        o.set(x)
      }
    })
  }

  /**
   * Takes a signal and a function
   * When the signal has a truthy value,
   * the function is called with the value of the signal
   *
   * @param {!Signal.<T>} x
   * @param {function(T=):void} f
   * @template T
   */
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
  }

  /**
   * Takes a signal and function; returns a signal
   * Maps the function over the input signal
   *
   * @param {!Signal.<T>} x
   * @param {function(T):R} f
   * @return {!Signal.<R>}
   * @template T, R
   */
  util.cell.map = function (x, f) {
    return util.cell.bind([x], f)
  }

  /**
   * Takes 1 or more signals, returns the logical OR of the values
   *
   * @param {...!Signal.<T>} var_args
   * @return {!Signal.<T>}
   * @template T
   */
  util.cell.or = function (var_args) {
    return util.cell.bind(arguments, function () {
      return array.some(arguments, function (x) {
        return !!x
      })
    })
  }

  /**
   * Takes 1 or more signals, returns the logical AND of the values
   *
   * @param {...!Signal.<T>} var_args
   * @return {!Signal.<T>}
   * @template T
   */
  util.cell.and = function (var_args) {
    return util.cell.bind(arguments, function () {
      return array.every(arguments, function (x) {
        return !!x
      })
    })
  }
})
