define(["./name"], function (name) {
  "use strict";

  var _value  = new name.Name()
  var _events = new name.Name()

  function call(a, f) {
    return f.apply(null, a.map(function (x) {
      return x.get()
    }))
  }

  function Const(x) {
    this[_value]  = x
    this[_events] = []
  }
  Const.prototype.get = function () {
    return this[_value]
  }

  function Value(x) {
    Const.call(this, x)
  }
  Value.prototype = new Const()
  Value.prototype.set = function (v) {
    this[_value] = v
    this[_events].forEach(function (f) {
      f()
    })
  }

  function On(a, f) {
    Value.call(this)
    var self = this
    function onset() {
      self.set(call(a, f))
    }
    // TODO binds duplicates if called multiple times
    this.bind = function () {
      onset()
      a.forEach(function (x) {
        x[_events].push(onset)
      })
    }
    this.unbind = function () {
      a.forEach(function (x) {
        var i = x[_events].indexOf(onset)
        if (i !== -1) {
          x[_events].splice(i, 1)
        }
      })
    }
    this.bind()
  }
  On.prototype = new Value()

  return Object.freeze({
    constant: function (x) {
      return new Const(x)
    },
    value: function (x) {
      return new Value(x)
    },
    on: function (a, f) {
      return new On(a, f)
    }
  })
})
