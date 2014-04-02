// This is a Node.js module that makes it easier to build an application created with the Google Closure compiler

var spawn = require("child_process").spawn
  , fs    = require("fs")
  , path  = require("path")
//  , http  = require("http")
//  , zlib  = require("zlib")

function normalize(s) {
  return path.join.apply(null, s.split(/\//g))
}

// TODO async version ?
function getFiles(p) {
  var r = []
  ;(function anon(p) {
    fs.readdirSync(p).forEach(function (x) {
      if (x[0] !== ".") {
        var full = path.join(p, x)
        if (fs.statSync(full).isDirectory()) {
          anon(full)
        } else if (path.extname(x) === ".js") {
          r.push(full)
        }
      }
    })
  })(p)
  return r
}

function shift(x, s) {
	var old = x[s]
	delete x[s]
	x[s] = old
}

function closure(actions, info) {
  var closure = normalize(info.closure.path)

  Object.keys(info.closure.modules).forEach(function (s) {
    var folders = info.closure.modules[s].dirs
      , file    = normalize(info.closure.modules[s].outfile)

    var sourcemap = file + ".map.json"

    var command = ["-jar", closure]
    folders.forEach(function (x) {
      getFiles(normalize(x)).forEach(function (x) {
        command.push("--js")
        command.push(x)
      })
    })
    info.closure.externs.forEach(function (x) {
      command.push("--externs", normalize(x))
    })
    //command.push("--process_closure_primitives")
    command.push("--only_closure_dependencies")
    command.push("--closure_entry_point", s)
    command.push("--js_output_file", file)
    command.push("--define", "util.log.DEBUG=" + !!info.config.logging)
    command.push("--use_types_for_optimization")
    command.push("--compilation_level", "ADVANCED_OPTIMIZATIONS")
    command.push("--use_only_custom_externs")
    command.push("--summary_detail_level", "3")
    command.push("--warning_level", "VERBOSE")
    ;["accessControls",
      "ambiguousFunctionDecl",
      "checkEventfulObjectDisposal",
      "checkRegExp",
      "checkStructDictInheritance",
      "checkTypes",
      "checkVars",
      "const",
      "constantProperty",
      "deprecated",
      "duplicateMessage",
      "es3",
      "es5Strict",
      "externsValidation",
      "fileoverviewTags",
      "globalThis",
      "internetExplorerChecks",
      "invalidCasts",
      "misplacedTypeAnnotation",
      "missingProperties",
      "missingProvide",
      "missingRequire",
      "missingReturn",
      "nonStandardJsDocs",
      //"reportUnknownTypes",
      "suspiciousCode",
      "strictModuleDepCheck",
      "typeInvalidation",
      "undefinedNames",
      "undefinedVars",
      "unknownDefines",
      "uselessCode",
      "visibility"].forEach(function (x) {
      command.push("--jscomp_error", x)
    })
    ;[].forEach(function (x) {
      command.push("--jscomp_warning", x)
    })
    if (info.config.debug) {
      //command.push("--output_manifest", "manifest.MF")
      command.push("--debug")
      command.push("--formatting", "PRETTY_PRINT")
    }
    if (info.config.sourcemap) {
      command.push("--create_source_map", sourcemap)
      command.push("--source_map_format", "V3")
    }

    var output = "%output%"
    if (info.config.sourcemap) {
      output = output + "\n//# sourceMappingURL=" + path.basename(sourcemap)
    }
    if (info.config.nodejs) {
      output = "#! /usr/bin/env node\n" + output
    }
    if (output !== "%output%") {
      command.push("--output_wrapper", output)
    }

		actions.push(function (done) {
			var io = spawn("java", command, { stdio: "inherit" })

			io.on("exit", function (code) {
				if (code === 0) {
					// TODO generic source map code
					if (info.config.sourcemap) {
						var y = JSON.parse(fs.readFileSync(sourcemap, { encoding: "utf8" }))
						if ("sourceRoot" in info.config) {
							y["sourceRoot"] = info.config.sourceRoot
						}
						shift(y, "mappings")
						shift(y, "names")
						fs.writeFileSync(sourcemap, JSON.stringify(y, null, 4))
					}
					done(null)

				} else {
					console.log("exited with code " + code)
					done(new Error())
				}
			})
		})
  })
}

module.exports = function (f) {
	var actions = []

	var o = {
		pull: function (s) {
			actions.push(function (done) {
				var old = process.cwd()
				process.chdir(normalize(s))
				console.log("DIRECTORY CHANGED TO " + normalize(s))
				spawn("git", ["pull"], { stdio: "inherit" }).on("exit", function (code) {
					process.chdir(old)
					console.log("DIRECTORY CHANGED TO " + old)
					console.log(code)
					if (code === 0) {
						done(null)
					} else {
						done(new Error())
					}
				})
			})
		},

		// TODO mkdirp
		mkdir: function (name) {
			actions.push(function (done) {
				fs.mkdir(normalize(name), function (err) {
					/*if (e.code !== "EEXIST") {
						throw e
					}*/
					console.log(err)
					done(null)
				})
			})
		}
	}

	f(o)

	if (o.config == null) {
		o.config = {}
	}

	if (o.closure != null) {
		closure(actions, o)
	} else {
		throw new Error()
	}

	function next() {
		if (actions.length !== 0) {
			var f = actions.shift()
			f(function (x) {
				if (x === null) {
					next()
				} else {
					throw x
				}
			})
		}
	}
	next()
}

/*var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close();
      cb();
    });
  });
}*/
