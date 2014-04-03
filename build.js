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

function next(actions, done) {
	if (actions.length !== 0) {
		var f = actions.shift()
		f(function (x) {
			if (x === null) {
				next(actions, done)
			} else {
				throw x
			}
		})
	} else {
		done()
	}
}

function parallel(actions, done) {
	var i = actions.length
	if (i === 0) {
		done()
	} else {
		actions.forEach(function (f) {
			f(function (x) {
				if (x !== null) {
					throw x
				}
				--i
				if (i === 0) {
					done()
				}
			})
		})
	}
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
		if (info.config.verbose) {
			command.push("--summary_detail_level", "3")
		} else {
			command.push("--summary_detail_level", "1")
		}
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
			if (info.config.verbose) {
				console.log("compiling module " + s)
			}

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
					done(new Error("Closure exited with code " + code))
				}
			})
		})
  })
}

module.exports = function (f) {
	var actions = []

	var o = {
		pull: function (s) {
			s = normalize(s)
			actions.push(function (done) {
				var old = process.cwd()
				process.chdir(s)
				if (o.config.verbose) {
					console.log("changing to directory " + s)
				}
				spawn("git", (o.config.verbose
					             ? ["pull"]
					             : ["pull", "--quiet"]),
					           { stdio: "inherit" }).on("exit", function (code) {
					process.chdir(old)
					if (code === 0) {
						done(null)
					} else {
						done(new Error("git pull exited with code " + code))
					}
				})
			})
		},

		// TODO mkdirp
		mkdir: function (name) {
			name = normalize(name)
			actions.push(function (done) {
				if (o.config.verbose) {
					console.log("making directory " + s)
				}
				fs.mkdir(name, function (e) {
					if (o.config.verbose) {
						if (e === null) {
							console.log("success")
						} else if (e.code === "EEXIST") {
							console.log("success, but directory already existed")
						}
					}
					if (e === null || e.code === "EEXIST") {
						done(null)
					} else {
						done(e)
					}
				})
			})
		}
	}

	f(o)

	if (o.config == null) {
		o.config = {}
	}

	var async = []

	if (o.closure != null) {
		closure(async, o)
	} else {
		throw new Error()
	}

	next(actions, function () {
		parallel(async, function () {
			if (o.config.verbose) {
				console.log("BUILD COMPLETE")
			}
		})
	})
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
