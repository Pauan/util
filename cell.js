// Extremely light-weight Functional Reactive Programming implementation
// Event dispatch is handled synchronously: no concurrency or parallelism
// Loosely based on Elm (http://elm-lang.org/)
"use strict";

var key    = require("./symbol")
  , object = require("./object")

var events = key.Symbol("events")
  , info   = key.Symbol("info")
  , saved  = key.Symbol("saved")
  , get    = key.Symbol("get")
  , array  = key.Symbol("array")
  , func   = key.Symbol("func")

function call(a, f) {
  return f.apply(null, a.map(function (x) {
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
  var i = x[events].indexOf(f)
  if (i !== -1) {
    x[events].splice(i, 1)
    if (x[events].length === 0 && x[info].unbind != null) {
      x[info].unbind(x[saved])
    }
  }
}

function unbind() {
  var a = this[array]
    , f = this[func]
  for (var i = 0, iLen = a.length; i < iLen; ++i) {
    unbind1(a[i], f)
  }
}

function binder(o, a, f) {
  for (var i = 0, iLen = a.length; i < iLen; ++i) {
    bind1(a[i], f)
  }
  o[array] = a
  o[func]  = f
  o.unbind = unbind
}

function set(v) {
  this[get] = v
  if (this[info].set != null) {
    this[info].set(this, v)
  }
  var a = this[events].slice() // TODO inefficient, it's here to prevent a bug when unbinding inside the called function
  for (var i = 0, iLen = a.length; i < iLen; ++i) {
    a[i](v)
  }
}

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
Value.prototype.set = set

// TODO code duplication
function Dedupe(x, obj) {
  if (obj == null) {
    obj = {}
  }
  this[get]    = x
  this[info]   = obj
  this[events] = []
}
Dedupe.prototype.get = Value.prototype.get
Dedupe.prototype.set = function (v) {
  if (object.isnt(this[get], v)) {
    set.call(this, v)
  }
}

// Reifies a JavaScript value as a signal
// use the get method to get the current value
// use the set method to set the current value
function value(x, obj) {
  return new Value(x, obj)
}
exports.value = value

// Same as value, except it ignores duplicates
function dedupe(x, obj) {
  return new Dedupe(x, obj)
}
exports.dedupe = dedupe

// Takes an integer; returns a signal
// Updates the signal ASAP, but not faster than the input integer (in FPS)
// http://www.sitepoint.com/creating-accurate-timers-in-javascript/
// TODO is there a better implementation for this?
function fps(i) {
  // TODO is this any faster/less memory than using a closure?
  var state = {
    fps: 1000 / i,
    start: Date.now(),
    count: 0,
    cell: value(0),
    step: function anon() {
      ++this.count

      var diff = (Date.now() - this.start) - (this.count * this.fps)
      this.cell.set(diff)

      setTimeout(anon, this.fps - diff)
    }
  }
  setTimeout(state.step, state.fps)
  return state.cell
}
exports.fps = fps

// Takes an array of signals and a function
// When any of the signals change, the function is called with the value of the signals
function event(a, f) {
  var o = {}
  binder(o, a, function () {
    call(a, f)
  })
  return o
}
exports.event = event

// Takes an array of signals and a function; returns a signal
// Initially, and when any of the signals change,
// the function is called with the value of the signals
function bind(a, f) {
  var x = call(a, f)
    , o = value(x)
  binder(o, a, function () {
    o.set(call(a, f))
  })
  return o
}
exports.bind = bind

// TODO remove this ?
// Takes an initial JavaScript value, a signal, and a function; returns a signal
// When the input signal changes, it will call the input function with the previous
// value and the current value of the input signal
function fold(init, x, f) {
  var o = value(init)
  binder(o, [x], function (x) {
    o.set((init = f(init, x)))
  })
  return o
}
exports.fold = fold

// Takes a value, signal, and a function; returns a signal
// The initial value of the returned signal is init
// The function is called with the signal's value
// If it returns true, the returned signal is updated
function filter(init, x, f) {
  var o = value(init)
  binder(o, [x], function (x) {
    if (f(x)) {
      o.set(x)
    }
  })
  return o
}
exports.filter = filter

// Takes a signal and a function
// When the signal has a truthy value,
// the function is called with the value of the signal
function when(x, f) {
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
exports.when = when

// Takes a signal and function; returns a signal
// Maps the function over the input signal
function map(x, f) {
  return bind([x], f)
}
exports.map = map

// Takes 1 or more signals, returns the logical OR of the values
function or() {
  return bind([].slice.call(arguments), function () {
    for (var i = 0, iLen = arguments.length; i < iLen; ++i) {
      if (arguments[i]) {
        return true
      }
    }
    return false
  })
}
exports.or = or

// Takes 1 or more signals, returns the logical AND of the values
function and() {
  return bind([].slice.call(arguments), function () {
    for (var i = 0, iLen = arguments.length; i < iLen; ++i) {
      if (!arguments[i]) {
        return false
      }
    }
    return true
  })
}
exports.and = and