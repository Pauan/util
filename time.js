"use strict";

// TODO this probably isn't super-robust, but it should work for common cases
var iMax = null

function timestamp() {
  var x = Date.now()
  if (iMax === null || x > iMax) {
    iMax = x
  } else {
    x = ++iMax
  }
  return x
}
exports.timestamp = timestamp

function benchmark(f, duration) {
  if (duration == null) {
    duration = 10000
  }

  var i   = 0
    , t   = performance
    , mem = {}

  // TODO check this
  for (var s in t.memory) {
    mem[s] = t.memory[s]
  }

  var start = t.now()
    , end   = start + duration
    , curr

  while ((curr = t.now()) < end) {
    f()
    ++i
  }

  for (var s in t.memory) {
    mem[s] = t.memory[s] - mem[s]
  }

  return {
    iterations: i,
    milliseconds: (curr - start) / i,
    memory: mem
  }
}
exports.benchmark = benchmark