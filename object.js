"use strict";

function type(x) {
  return {}.toString.call(x)
}
exports.type = type

function typeChecker(s) {
  return function (x) {
    return type(x) === s
  }
}

var isArray    = exports.isArray    = typeChecker("[object Array]")
var isBoolean  = exports.isBoolean  = typeChecker("[object Boolean]")
var isDate     = exports.isDate     = typeChecker("[object Date]")
var isError    = exports.isError    = typeChecker("[object Error]")
var isFunction = exports.isFunction = typeChecker("[object Function]")
var isNumber   = exports.isNumber   = typeChecker("[object Number]")
var isRegExp   = exports.isRegExp   = typeChecker("[object RegExp]")
var isString   = exports.isString   = typeChecker("[object String]")
var isDict     = exports.isDict     = typeChecker("[object Object]")

function isObject(x) {
  return Object(x) === x
}
exports.isObject = isObject

function isArrayLike(x) {
  return (isObject(x) && "length" in x) || isString(x)
}
exports.isArrayLike = isArrayLike

function has(x, y) {
  return isObject(x) && y in x
}
exports.has = has

// http://wiki.ecmascript.org/doku.php?id=harmony:egal
function is(x, y) {
  if (x === y) {
    // 0 === -0, but they are not identical
    return x !== 0 || 1 / x === 1 / y
  } else {
    // NaN !== NaN, but they are identical.
    // NaNs are the only non-reflexive value, i.e., if x !== x,
    // then x is a NaN.
    // isNaN is broken: it converts its argument to number, so
    // isNaN("foo") => true
    return x !== x && y !== y
  }
}
exports.is = is

function isnt(x, y) {
  return !is(x, y)
}
exports.isnt = isnt

function iso(x, y) {
  if (is(x, y)) {
    return true
  } else if (isObject(x) && isObject(y)) {
    var s
    for (s in x) {
      if (!(s in y && iso(x[s], y[s]))) {
        return false
      }
    }
    for (s in y) {
      if (!(s in x)) {
        return false
      }
    }
    return true
  } else {
    return false
  }
}
exports.iso = iso


function create(x) {
  return Object.create(x)
}
exports.create = create

function merge(x) {
  x = create(x)
  for (var i = 1, iLen = arguments.length; i < iLen; ++i) {
    var y = arguments[i]
    for (var s in y) {
      if ({}.hasOwnProperty.call(y, s)) {
        x[s] = y[s]
      }
    }
  }
  return x
}
exports.merge = merge

function deepMerge(x, y) {
  if (isObject(y)) {
    if (!isObject(x)) {
      x = {}
    }
    for (var s in y) {
      if ({}.hasOwnProperty.call(y, s)) {
        x[s] = deepMerge(x[s], y[s])
      }
    }
    return x
  } else {
    return y
  }
}
exports.deepMerge = deepMerge

function clone(x) {
  var y = {}
  for (var s in x) {
    if ({}.hasOwnProperty.call(x, s)) {
      y[s] = x[s]
    }
  }
  return y
}
exports.clone = clone

function deepClone(x) {
  var y = {}
  for (var s in x) {
    if ({}.hasOwnProperty.call(x, s)) {
      if (isObject(x[s])) {
        y[s] = deepClone(x[s])
      } else {
        y[s] = x[s]
      }
    }
  }
  return y
}
exports.deepClone = deepClone

function set(o, k, v) {
  if (k in o) {
    o = Object.create(o)
  }
  o[k] = v
  return o
}
exports.set = set