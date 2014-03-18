// This is a Node.js module that makes it easier to build an application created with the Google Closure compiler

var spawn = require("child_process").spawn
  , fs    = require("fs")
  , path  = require("path")

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

exports.compile = function (info) {
  var commands = Object.keys(info.modules).map(function (s) {
    var folders = info.modules[s].dirs
      , file    = info.modules[s].outfile

    var sourcemap = file + ".map.json"

    var command = ["-jar", info.closure]
    folders.forEach(function (x) {
      getFiles(x).forEach(function (x) {
        command.push("--js")
        command.push(x)
      })
    })
    //command.push("--process_closure_primitives")
    command.push("--only_closure_dependencies")
    command.push("--closure_entry_point", s)
    command.push("--js_output_file", file)
    command.push("--define", "util.log.DEBUG=" + !!info.debug)
    info.externs.forEach(function (x) {
      command.push("--externs", x)
    })
    command.push("--use_types_for_optimization")
    command.push("--compilation_level", "ADVANCED_OPTIMIZATIONS")
    command.push("--use_only_custom_externs")
    if (info.debug) {
      command.push("--debug")
      command.push("--formatting", "PRETTY_PRINT")
    }
    if (info.debug) {
      ;[//"reportUnknownTypes",
        "accessControls",
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
        "suspiciousCode",
        "strictModuleDepCheck",
        "typeInvalidation",
        "undefinedNames",
        "undefinedVars",
        "unknownDefines",
        "uselessCode",
        "visibility"].forEach(function (x) {
          command.push("--jscomp_warning", x)
        })
      command.push("--summary_detail_level", "3")
      command.push("--warning_level", "VERBOSE")
      //command.push("--output_manifest", "manifest.MF")

      command.push("--create_source_map", sourcemap)
      command.push("--source_map_format", "V3")
    }

    var output = "%output%"
    if (info.debug) {
      output = output + "\n//# sourceMappingURL=" + path.basename(sourcemap)
    }
    if (info.nodejs) {
      output = "#! /usr/bin/env node\n" + output
    }
    if (output !== "%output%") {
      command.push("--output_wrapper", output)
    }

    return {
      command: command,
      sourcemap: sourcemap
    }
  })

  function shift(x, s) {
    var old = x[s]
    delete x[s]
    x[s] = old
  }

  commands.forEach(function (com) {
    //setTimeout(function () {
      var io = spawn("java", com.command, { stdio: "inherit" })

      io.on("exit", function (code) {
        if (code === 0) {
          // TODO generic source map code
          if (info.debug) {
            var y = JSON.parse(fs.readFileSync(com.sourcemap, { encoding: "utf8" }))
            if ("sourceRoot" in info) {
              y["sourceRoot"] = info.sourceRoot
            }
            shift(y, "mappings")
            shift(y, "names")
            fs.writeFileSync(com.sourcemap, JSON.stringify(y, null, 4))
          }

        } else {
          console.log("exited with code " + code)
        }
      })
    //}, 0)
  })
}

// TODO mkdirp
exports.mkdir = function (name) {
  try {
    fs.mkdirSync(name)
  } catch (e) {
    if (e.code !== "EEXIST") {
      throw e
    }
  }
}
