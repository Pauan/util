define(["./name", "./object", "./iter"], function (name, object, iter) {
  "use strict";
  
  var sort  = new name.Name()
    , array = new name.Name()
  
  function SortedArray(f) {
    if (!(this instanceof SortedArray)) {
      return new SortedArray(f)
    }
    this[sort]  = f
    this[array] = []
  }
  SortedArray.prototype.has = function (x) {
    return this[array].indexOf(x) !== -1
  }
  SortedArray.prototype.indexOf = function (x) {
    return this[array].indexOf(x)
  }
  SortedArray.prototype.get = function (i) {
    return this[array][i]
  }
  SortedArray.prototype.add = function (x) {
    var a = this[array]
      , f = this[sort]
    for (var i = 0, iLen = a.length; i < iLen; ++i) {
      if (object.is(x, a[i])) {
        return i
      } else if (f(x, a[i])) {
        a.splice(i, 0, x)
        return i
      }
    }
    return a.push(x) - 1
  }
  SortedArray.prototype.remove = function (x) {
    var i = this[array].indexOf(x)
    if (i !== -1) {
      this[array].splice(i, 1)
    }
  }
  SortedArray.prototype.sort = function (f) {
    this[sort] = f
    this[array].sort(function (x, y) {
      if (object.is(x, y)) {
        return 0
      } else if (f(x, y)) {
        return -1
      } else {
        return 1
      }
    })
  }
  SortedArray.prototype[iter.iterator] = function () {
    return iter.toIterator(this[array])
  }
  
  return SortedArray
})
