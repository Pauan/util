define(["./name", "./iter"], function (name, iter) {
  "use strict";

  var events = new name.Name()
    , all    = []

  function Event() {
    this[events] = {}
    all.push(this)
  }
  Event.prototype.on = function (s, f) {
    var a = this[events][s]
    if (!a) {
      a = this[events][s] = []
    }
    a.push(f)
  }
  Event.prototype.off = function (s, f) {
    var a = this[events][s]
    if (a) {
      var i = a.indexOf(f)
      if (i !== -1) {
        a.splice(i, 1)
      }
      if (a.length === 0) {
        delete this[events][s]
      }
    }
  }
  Event.prototype.send = function (s) {
    var a = this[events][s]
    if (a) {
      var args = [].slice.call(arguments, 1)
      a.forEach(function (f) {
        // TODO why is this here?
        if (f) {
          f.apply(null, args)
        }
      })
      //console.log("sending", s, events[s].length)
    }/* else {
      console.log("sending", s, 0)
    }*/
  }
  Event.prototype.sandbox = function (win) {
    var saved = {}
      , old   = this
      , o     = Object.create(old)
    o.on = function (s, f) {
      old.on(s, f)
      if (!old.stored[s]) {
        old.stored[s] = []
      }
      old.stored[s].push(f)
    }
    return o
  }

  return Object.freeze({
    Event: Event,
  })
})
