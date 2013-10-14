define(function () {
  "use strict";
  
  // TODO this probably isn't super-robust, but it should work for common cases
  var iMax = null
  function timestamp() {
    var x = Date.now()
    if (iMax == null) {
      iMax = x
    } else if (x <= iMax) {
      x = ++iMax
    }
    return x
  }
  
  return Object.freeze({
    timestamp: timestamp,
  })
})
