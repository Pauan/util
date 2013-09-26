define(["./name", "./object", "./iter"], function (name, object, iter) {
  "use strict";
  
  var sort  = new name.Name()
    , array = new name.Name()
  
  function SortedMap(f) {
    if (!(this instanceof SortedMap)) {
      return new SortedMap(f)
    }
    this[sort]  = f
    this[array] = []
  }
  SortedMap.prototype.indexOf = function (k) {
    var a = this[array]
    for (var i = 0, iLen = a.length; i < iLen; ++i) {
      if (object.is(k, a[i][0])) {
        return i
      }
    }
    return -1
  }
  SortedMap.prototype.has = function (k) {
    return this.indexOf(k) !== -1
  }
  SortedMap.prototype.get = function (k) {
    var a = this[array]
      , i = this.indexOf(k)
    return a[i][1]
  }
  SortedMap.prototype.set = function (k, v) {
    var a = this[array]
      , f = this[sort]
      , x
    for (var i = 0, iLen = a.length; i < iLen; ++i) {
      x = a[i]
      if (object.is(k, x[0])) {
        x[1] = v
        return i
      } else if (f(k, x[0])) {
        a.splice(i, 0, [k, v])
        return i
      }
    }
    return a.push([k, v]) - 1
  }
  /*SortedMap.prototype.setNew = function (k, f) {
    var a = this[array]
      , i = this.indexOf(k)
    if (i === -1) {
      f = f()
      this.set(k, f)
      return f
    } else {
      return a[i][1]
    }
  }*/
  SortedMap.prototype.sortedIndex = function (k) {
    var a = this[array]
      , f = this[sort]
      , x
    for (var i = 0, iLen = a.length; i < iLen; ++i) {
      x = a[i]
      if (object.is(k, x[0])) {
        x = a[i + 1]
        if (x && f(k, x[0])) {
          return i
        } else {
          continue
        }
      } else if (f(k, x[0])) {
        return i
      }
    }
    return a.length
  }
  SortedMap.prototype.getIndex = function (i) {
    // TODO should this be like this?
    if (i in this[array]) {
      return this[array][i][1]
    }
  }
  SortedMap.prototype.remove = function (k) {
    var i = this.indexOf(k)
    if (i !== -1) {
      var x = this[array][i][1]
      this[array].splice(i, 1)
      return x
    }
  }
  SortedMap.prototype.length = function () {
    return this[array].length
  }
  SortedMap.prototype.sort = function (f) {
    this[sort] = f
    this[array].sort(function (x, y) {
      if (object.is(x[0], y[0])) {
        return 0
      } else if (f(x[0], y[0])) {
        return -1
      } else {
        return 1
      }
    })
  }
  SortedMap.prototype[iter.iterator] = function () {
    return iter.toIterator(this[array])
  }
  
  return SortedMap
})
