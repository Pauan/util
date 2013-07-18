define(["./object"], function (object) {
  "use strict";

  function value(x) {
    var events = []
    return {
      get: function () {
        return x
      },
      set: function (v) {
        x = v
        events.forEach(function (f) {
          f()
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

  function call(a, f) {
    return f.apply(null, a.map(function (x) {
      return x.get()
    }))
  }

  function on(a, f) {
    var o = value(call(a, f))
    function onset() {
      o.set(call(a, f))
    }
    a.forEach(function (x) {
      x.bind(onset)
    })
    return o
  }

  function fold(init, x, f) {
    return on([x], function (x) {
      return (init = f(init, x))
    })
  }

  // TODO is there a better way to implement this?
  function dedupe(x) {
    var o = value(x.get())
    on([x], function (x) {
      if (object.isnt(o.get(), x)) {
        o.set(x)
      }
    })
    return o
  }

  return Object.freeze({
    value: value,
    on: on,
    fold: fold,
    dedupe: dedupe,
  })
})
