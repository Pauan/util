// Extremely light-weight Functional Reactive Programming implementation
// Event dispatch is handled synchronously: no concurrency or parallelism
// VERY loosely based on Elm (http://elm-lang.org/)
goog.provide("util.cell")

goog.require("util.Symbol")
goog.require("util.array")

goog.scope(function () {
  var Symbol = util.Symbol
    , array  = goog.array

  var events = Symbol("events")
    , info   = Symbol("info")
    , saved  = Symbol("saved")
    , get    = Symbol("get")

  /**
   * @param {!Array.<Value>} a
   * @param {function(...*):T} f
   * @return {T}
   * @template T
   */
  function call(a, f) {
    return f.apply(null, array.map(a, function (x) {
      return x.get()
    }))
  }

  /**
   * @param {!Value} x
   * @param {function(*):void} f
   */
  function bind1(x, f) {
    if (array.len(x[events]) === 0 && x[info].bind != null) {
      x[saved] = x[info].bind(x)
    }
    array.push(x[events], f)
  }

  /**
   * @param {!Value} x
   * @param {function(*):void} f
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
   * @param {!Array.<Value>} a
   * @param {function(*):void} f
   */
  function unbind(a, f) {
    array.each(a, function (x) {
      unbind1(x, f)
    })
  }

  /**
   * @param {!Object} o
   * @param {!Array.<Value>} a
   * @param {function(*):void} f
   */
  function binder(o, a, f) {
    array.each(a, function (x) {
      bind1(x, f)
    })
    o.unbind = function () {
      unbind(a, f)
    }
  }

  /**
   * @param {!Value} self
   * @param {*} v
   */
  function set(self, v) {
    self[get] = v
    if (self[info].set != null) {
      self[info].set(self, v)
    }
                  // TODO inefficient, it's here to prevent a bug when unbinding inside the called function
    array.each(array.clone(self[events]), function (f) {
      f(v)
    })
  }

  /**
   * TODO more specific type for the obj parameter, using record type with optional fields
   * @constructor
   * @param {*} x
   * @param {Object=} obj
   */
  function Value(x, obj) {
    if (obj == null) {
      obj = {}
    }

    /**
     * @type {!Object}
     */
    this[info]   = obj

    this[get]    = x
    this[events] = []
  }
  Value.prototype.get = function () {
    return this[get]
  }
  Value.prototype.set = function (v) {
    set(this, v)
  }

  /**
   * TODO more specific type for the obj parameter, using record type with optional fields
   * TODO code duplication for the type signature with Value
   * @constructor
   * @extends {Value}
   * @param {*} x
   * @param {Object=} obj
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

  /**
   * Reifies a JavaScript value as a signal
   * use the get method to get the current value
   * use the set method to set the current value
   *
   * TODO more specific type for the obj parameter, using record type with optional fields
   * TODO code duplication for the type signature with Value
   * @param {*} x
   * @param {Object=} obj
   */
  util.cell.value = function (x, obj) {
    return new Value(x, obj)
  }

  /**
   * Same as value, except it ignores duplicates
   *
   * TODO more specific type for the obj parameter, using record type with optional fields
   * TODO code duplication for the type signature with Value
   * @param {*} x
   * @param {Object=} obj
   */
  util.cell.dedupe = function (x, obj) {
    return new Dedupe(x, obj)
  }

  /**
   * Takes an array of signals and a function
   * When any of the signals change, the function is called with the value of the signals
   *
   * @param {!Array.<Value>} a
   * @param {function(...*):void} f
   * @return {{ unbind: function():void }}
   */
  util.cell.event = function (a, f) {
    var o = {}
    binder(o, a, function () {
      call(a, f)
    })
    return o
  }

  /**
   * Takes an array of signals and a function; returns a signal
   * Initially, and when any of the signals change,
   * the function is called with the value of the signals
   *
   * @param {!Array.<Value>} a
   * @param {function(...*):*} f
   * @return {!Value}
   */
  util.cell.bind = function (a, f) {
    var x = call(a, f)
      , o = util.cell.value(x)
    binder(o, a, function () {
      o.set(call(a, f))
    })
    return o
  }

  /**
   * TODO remove this ?
   * TODO can I do something like @return {!Value.<T>} ?
   * Takes an initial JavaScript value, a signal, and a function; returns a signal
   * When the input signal changes, it will call the input function with the previous
   * value and the current value of the input signal
   *
   * @param {*} init
   * @param {!Value} x
   * @param {function(*, *):*} f
   * @return {!Value}
   */
  util.cell.fold = function (init, x, f) {
    var o = util.cell.value(init)
    binder(o, [x], function (x) {
      o.set((init = f(init, x)))
    })
    return o
  }

  /**
   * Takes a value, signal, and a function; returns a signal
   * The initial value of the returned signal is init
   * The function is called with the signal's value
   * If it returns true, the returned signal is updated
   *
   * @param {*} init
   * @param {!Value} x
   * @param {function(*):boolean} f
   * @return {!Value}
   */
  util.cell.filter = function (init, x, f) {
    var o = util.cell.value(init)
    binder(o, [x], function (x) {
      if (f(x)) {
        o.set(x)
      }
    })
    return o
  }

  /**
   * Takes a signal and a function
   * When the signal has a truthy value,
   * the function is called with the value of the signal
   *
   * @param {!Value} x
   * @param {function(*=):void} f
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
    //return o
  }

  /**
   * Takes a signal and function; returns a signal
   * Maps the function over the input signal
   *
   * @param {!Value} x
   * @param {function(*):*} f
   * @return {!Value}
   */
  util.cell.map = function (x, f) {
    return util.cell.bind([x], f)
  }

  /**
   * Takes 1 or more signals, returns the logical OR of the values
   *
   * @param {...!Value} var_args
   * @return {!Value}
   */
  util.cell.or = function (var_args) {
    return util.cell.bind(arguments, function () {
      return array.some(arguments, function (x) {
        return x
      })
    })
  }

  /**
   * Takes 1 or more signals, returns the logical AND of the values
   *
   * @param {...!Value} var_args
   * @return {!Value}
   */
  util.cell.and = function (var_args) {
    return util.cell.bind(arguments, function () {
      return array.every(arguments, function (x) {
        return x
      })
    })
  }
})
