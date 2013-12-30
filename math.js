define([], function () {
  "use strict";

  // http://www.johndcook.com/blog/2010/06/02/whats-so-hard-about-finding-a-hypotenuse/
  function hypot(x, y) {
    x = Math.abs(x)
    y = Math.abs(y)
    // TODO could optimize a bit...
    var max = Math.max(x, y)
      , min = Math.min(x, y)
      , r   = min / max
    return max * Math.sqrt(1 + (r * r))
  }

  return {
    hypot: hypot,
  }
})