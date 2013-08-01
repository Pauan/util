// Extremely light-weight Functional Reactive Programming implementation
// Event dispatch is handled synchronously: no concurrency or parallelism
// Loosely based on Elm (http://elm-lang.org/)
define(["./name", "./object"], function (name, object) {
  "use strict";

  var events = new name.Name()
    , info   = new name.Name()

  //var skip = {}

  function call(a, f) {
    return f.apply(null, a.map(function (x) {
      return x.get()
    }))
  }

  function bind(x, unbind, f) {
    if (x[events].length === 0 && x[info].bind != null) {
      x[info].bind(x)
    }
    x[events].push(f)
    unbind.push({ object: x, bind: f })
  }

  return Object.freeze({
    value: value,
  })

  function make(win) {
    var unbind = []

    function unload() {
      unbind.forEach(function (o) {
        var i = o.object[events].indexOf(o.bind)
        if (i !== -1) {
          o.object[events].splice(i, 1)
        }
      })
    }

    win.addEventListener("unload", unload, true)
    win.addEventListener("beforeunload", unload, true)

    return Object.freeze({
      // If this is thrown inside of a cell, it will cause the cell to not update
      //skip: skip,

      //events: events, // TODO test this

      // Reifies a JavaScript value as a signal
      // use the get method to get the current value
      // use the set method to set the current value
      value: function (x, obj) {
        if (obj == null) {
          obj = {}
        }
        var o = {
          get: function () {
            return x
          },
          // TODO: maybe don't allow for setting ?
          set: function (v) {
            x = v
            if (obj.set != null) {
              obj.set(o, x)
            }
            this[events].forEach(function (f) {
              f(x)
            })
          }
        }
        o[events] = []
        o[info]   = obj
        return o
      },

      // Takes an integer; returns a signal
      // Updates the signal ASAP, but not faster than the input integer (in FPS)
      // http://www.sitepoint.com/creating-accurate-timers-in-javascript/
      // TODO is there a better implementation for this?
      fps: function (i) {
        i = 1000 / i
        var start = Date.now()
          , count = 0
          , o     = this.value(0)
        setTimeout(function anon() {
          ++count

          var diff = (Date.now() - start) - (count * i)
          o.set(diff)

          setTimeout(anon, i - diff)
        }, i)
        return o
      },

      // Takes an array of signals and a function
      // When any of the signals change, the function is called with the value of the signals
      event: function (a, f) {
        a.forEach(function (x) {
          bind(x, unbind, function () {
            //try {
              call(a, f)
            /*} catch (e) {
              if (e !== skip) {
                throw e
              }
            }*/
          })
        })
      },

      // Takes an array of signals and a function; returns a signal
      // Initially, and when any of the signals change,
      // the function is called with the value of the signals
      lift: function (a, f) {
        //try {
          var x = call(a, f)
        /*} catch (e) {
          if (e !== skip) {
            throw e
          }
        }*/
        var o = this.value(x)
        a.forEach(function (x) {
          bind(x, unbind, function () {
            //try {
              o.set(call(a, f))
            /*} catch (e) {
              if (e !== skip) {
                throw e
              }
            }*/
          })
        })
        return o
      },

      // Takes an initial JavaScript value, a signal, and a function; returns a signal
      // When the input signal changes, it will call the input function with the previous
      // value and the current value of the input signal
      fold: function (init, x, f) {
        var o = this.value(init)
        bind(x, unbind, function (x) {
          //try {
            o.set((init = f(init, x)))
          /*} catch (e) {
            if (e !== skip) {
              throw e
            }
          }*/
        })
        return o
      },

      // Takes a value, signal, and a function; returns a signal
      // The initial value of the returned signal is init
      // The function is called with the signal's value
      // If it returns true, the returned signal is updated
      filter: function (init, x, f) {
        var o = this.value(init)
        bind(x, unbind, function (x) {
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
      },

      // Takes an array of signals and a function
      // When all of the signals have a truthy value,
      // the function is called with the values of the signals
      when: function (a, f) {
        this.lift(a, function () {
          for (var i = 0, iLen = arguments.length; i < iLen; ++i) {
            if (!arguments[i]) {
              break
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
      },

      // Takes one or more signals; returns a signal
      // The returned signal updates whenever any of the input signals update
      // If two signals update at the same time, it updates from left-to-right
      merge: function (x) {
        var o = this.value(x.get())
        for (var i = 0, iLen = arguments.length; i < iLen; ++i) {
          bind(arguments[i], unbind, function (x) {
            o.set(x)
          })
        }
        return o
      },

      // Takes a signal and an integer; returns a signal
      // The returned signal is like the input signal but delayed by input integer milliseconds
      delay: function (x, i) {
        var o = this.value(x.get())
        bind(x, unbind, function (x) {
          setTimeout(function () {
            o.set(x)
          }, i)
        })
        return o
      },

      // Takes a signal; returns a signal
      // Consecutive duplicates are ignored
      // e.g. (1 -> 1 -> 2 -> 1 -> 1 -> 3 -> 3) is treated as
      //      (1 -> 2 -> 1 -> 3)
      // TODO is there a better way to implement this?
      dedupe: function (x) {
        var old = x.get()
        return this.filter(old, x, function (x) {
          if (object.isnt(old, x)) {
            old = x
            return true
          }
        })
      },

      // Takes a signal and function; returns a signal
      // Maps the function over the input signal
      map: function (x, f) {
        return this.lift([x], f)
      },

      // Takes two signals; returns a signal
      // When the first signal updates, the returned signal updates with the value of the second signal
      sample: function (x, y) {
        return this.map(x, function () {
          return y.get()
        })
      },
    })
  }

  var wins = []
    , objs = []

  return function (win) {
    var index = wins.indexOf(win)
    if (index === -1) {
      index = wins.push(win) - 1
      objs.push(make(win))
    }
    return objs[index]
  }
})