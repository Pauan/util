var fs   = require("fs")
  , path = require("path")

// TODO async version ?
exports.getFilesRecursive = function (p, filter) {
  var r = []
  ;(function anon(p) {
    fs.readdirSync(p).forEach(function (x) {
      if (x[0] !== ".") {
        var full = path.join(p, x)
        if (fs.statSync(full).isDirectory()) {
          anon(full)
        } else {
          r.push(full)
        }
      }
    })
  })(p)
  return r
}
