// TODO: Not quite correct, but it's the best I can do
"use strict";

var id  = 0
  , sId = "Symbol(0)"

function Symbol1(s) {
  if (s == null) {
    this[sId] = "Symbol(" + (++id) + ")"
  } else {
    this[sId] = "Symbol(\"" + s + "\", " + (++id) + ")"
  }
  Object.freeze(this) // TODO is this a good idea ?
}
Symbol1.prototype.toString = function () {
  return this[sId]
}

function Symbol(s) {
  return new Symbol1(s)
}
Exports.Symbol = Symbol