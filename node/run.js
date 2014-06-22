#! /usr/bin/env node

var dir  = require("./dir")
  , path = require("path")
  , fs   = require("fs")
  , vm   = require("vm")
  , repl = require("repl")
  , util = require("util")

var provides = {}

var requires = {}

var files = dir.getFilesRecursive(".").filter(function (x) {
  return path.extname(x) === ".js"
}).forEach(function (x) {
  var file = fs.readFileSync(x, { encoding: "utf8" })
  file.split(/\n+/).forEach(function (line) {
    var a
    if ((a = /^goog\.provide\("([^"]+)"\)/.exec(line))) {
      provides[a[1]] = {
        filename: x,
        contents: file
      }
    }
  })
})

var context = vm.createContext({
  console: console,
  goog: {
    provide: function (s) {
      var code = s.split(/\./).reduce(function (x, y) {
        return "(function (x) { return x." + y + " = (x." + y + " || {}) })(" + x + ")"
      }, "this")
      vm.runInContext(code, context)
    },
    require: function (s) {
      if (requires[s] == null) {
        requires[s] = true
        var info = provides[s]
        vm.runInContext(info.contents, context, info.filename)
      }
    },
    scope: function (f) {
      return f()
    }
  }
})

repl.start({
  useColors: true,
  eval: function (s, _, filename, callback) {
    try {
      return callback(null, vm.runInContext(s, context, filename))
    } catch (e) {
      return callback(e)
    }
  },
  writer: function (s) {
    return util.inspect(s, { colors: true, depth: null })
  }
})
