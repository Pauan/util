goog.provide("util.dom")

goog.require("util.Symbol")
goog.require("util.cell")
goog.require("util.array")
goog.require("util.type")
goog.require("util.log")

goog.scope(function () {
  var Symbol = util.Symbol
    , cell   = util.cell
    , array  = util.array
    , type   = util.type
    , log    = util.log.log

  var styleIds = 0

  var highestZIndex = "2147483647" /* 32-bit signed int */

  var _e       = Symbol("element")
    , _styles  = Symbol("styles")
    , bindings = Symbol("bindings")

  function isOver(self, e) {
    return !self["contains"](e["relatedTarget"])
  }

  function addRule(document, s, f) {
    var e = document["createElement"]("style")
    e["type"] = "text/css"
    document["head"]["appendChild"](e)

    var sheet = array.last(document["styleSheets"])
    sheet["insertRule"](s + "{}", array.len(sheet["cssRules"])) //sheet.addRule(s)

    return f(array.last(sheet["cssRules"])["style"])
  }

  var specialStyles = {
    "filter": ["-webkit-filter"]
  }

  function isSameStyle(x, y) {
    if (x === null) {
      x = ""
    }
    if (y === null) {
      y = ""
    }
    return x === y
  }

  /**
   * @constructor
   */
  function Style() {}
  Style.prototype = {
    set: function (s, v, important) {
      var self = this
      if (type.isArray(s)) {
        array.each(s, function (s) {
          self.set(s, v, type)
        })
      // TODO if v is null, convert it to ""
      //      http://dev.w3.org/csswg/cssom/#the-cssstyledeclaration-interface
      // TODO if v is not a string, throw an error
      } else {
        var props = (specialStyles[s] != null
                      ? specialStyles[s]
                      : [s])
        var sOld = array.map(props, function (s) {
          return self[_e]["getPropertyValue"](s)
        })
        array.each(props, function (s) {
          self[_e]["setProperty"](s, v, important)
        })
        var every = array.every(props, function (s, i) {
          var sNew = self[_e]["getPropertyValue"](s)
                                     // TODO a bit hacky ?
          return sOld[i] === sNew && !isSameStyle(v, sNew)
        })
        if (every) {
          throw new Error(s + ": " + v)
        }
      }
    }
  }

  /**
   * @constructor
   * @extends {Style}
   */
  function Style2() {}
  Style2.prototype = new Style()
  Style2.prototype.styles = function () {
    var a = this[_styles]
    array.each(arguments, function (x) {
      array.push(a, x)
    })
  }

  util.dom.style = function (f) {
    var name = "_" + (++styleIds)
    var o = new Style2()
    o.name = name
    o[_styles] = []
    addRule(document, "." + name, function (e) {
      o[_e] = e
      Object["freeze"](o) // TODO remove this later ?
      f(o)
    })
    return o
  }

  function addStyleTo(r, o, a) {
    array.each(a, function (x) {
      addStyleTo(r, o, x[_styles])
      var s = x.name
      if (o[s] == null) {
        o[s] = 0
        array.push(r, s)
      }
      ++o[s]
    })
  }

  function removeStyleFrom(r, o, a) {
    array.each(a, function (x) {
      var s = x.name
      if (o[s] != null) {
        --o[s]
        if (o[s] === 0) {
          delete o[s]
          array.push(r, s)
        }
        removeStyleFrom(r, o, x[_styles])
      }
    })
  }

  /**
   * @constructor
   */
  function Box() {}
  Box.prototype = {
    style: function (f) {
      // TODO remove this eventually
      if (array.len(arguments) > 1) {
        throw new Error()
      }
      var o = new Style()
      o[_e] = this[_e]["style"]
      Object["freeze"](o) // TODO remove this later ?
      f(o)
    },
    styles: function () {
      this[_styles] = {}

      var r = []
      addStyleTo(r, this[_styles], arguments)

      this[_e]["className"] = array.join(r, " ")
    },
    styleWhen: function (x, b) {
      var self = this[_e]
        , o    = this[_styles]
      if (b) {
        var s = x.name
        if (o[s] == null) {
          var r = []
          addStyleTo(r, o, [x])
          array.each(r, function (s) {
            self["classList"]["add"](s)
          })
        }
      } else {
        var r = []
        removeStyleFrom(r, o, [x])
        array.each(r, function (s) {
          self["classList"]["remove"](s)
        })
      }
    },
    styleObject: function (o, prop, b) {
      b = (b && o[prop] != null)
      if (b) {
        this.styleWhen(o[prop], true)
      }
      // TODO use "iter" module
      for (var s in o) {
        if (!(b && s === prop)) {
          this.styleWhen(o[s], false)
        }
      }
    },
    name: function (s) {
      this[_e]["name"] = s
    },
    addText: function (s) {
      this[_e]["appendChild"](document["createTextNode"](s || ""))
    },
    /*previous: function () {
      var e = this[_e].previousSibling
      while (true) {
        if (e) {
          if (_e in e) {
            return e[_e]
          } else {
            e = e.previousSibling
          }
        } else {
          return e
        }
      }
    },
    next: function () {
      var e = this[_e].nextSibling
      while (true) {
        if (e) {
          if (_e in e) {
            return e[_e]
          } else {
            e = e.nextSibling
          }
        } else {
          return e
        }
      }
    },*/
    dom: function () {
      return this[_e]
    },
    // TODO test the false version
    autofocus: function (b) {
      this[_e]["autofocus"] = b
    },
    stopDragging: function () {
      this[_e]["addEventListener"]("selectstart", function (e) {
        if (e["target"]["localName"] !== "input") { // && !e.target.draggable
          e["preventDefault"]()
        }
      }, true)
    },
    move: function (e) {
      e[_e]["appendChild"](this[_e])
      return this
    },
    moveBefore: function (e, x) {
      if (x) {
        e[_e]["insertBefore"](this[_e], x[_e])
      } else {
        e[_e]["appendChild"](this[_e])
      }
    },
    /*replace: function (e) {
      e[_e].parentNode.replaceChild(this[_e], e[_e])
    },*/

    text: function (s) {
      this[_e]["textContent"] = s || ""
    },
    remove: function () {
      this.removed = true
      var parent = this[_e]["parentNode"]
      if (parent) {
        parent["removeChild"](this[_e])
      }
    },
    bind: function (a, f) {
      var o = cell.bind(a, f)
      array.push(this[bindings], o)
      return o
    },
    event: function (a, f) {
      var o = cell.event(a, f)
      array.push(this[bindings], o)
      return o
    },
    title: function (s) {
      this[_e]["title"] = s
    },
    isHidden: function () {
      return !!this[_e]["hidden"]
    },
    hide: function () {
      this[_e]["hidden"] = true
    },
    show: function () {
      this[_e]["hidden"] = false
    },
    getPosition: function () {
      var o = this[_e]["getBoundingClientRect"]()
        , r = {}
      r.bottom = o["bottom"]
      r.height = o["height"]
      r.left   = o["left"]
      r.right  = o["right"]
      r.top    = o["top"]
      r.width  = o["width"]
      return r
    },
    // TODO this should only apply to certain things, like radio buttons and <option>s
    value: function (s) {
      this[_e]["value"] = s
    }
  }

  /**
   * @constructor
   * @extends {Box}
   */
  function ListItem() {}
  ListItem.prototype = new Box()
  ListItem.prototype.select = function () {
    this[_e]["selected"] = true
  }

  /**
   * @constructor
   * @extends {Box}
   */
  function ListGroup() {}
  ListGroup.prototype = new Box()
  ListGroup.prototype.label = function (s) {
    this[_e]["label"] = s
  }

  /**
   * @constructor
   * @extends {Box}
   */
  function Table() {}
  Table.prototype = new Box()
  Table.prototype.rowspan = function (s) {
    this[_e]["rowSpan"] = s
  }

  /**
   * @constructor
   * @extends {Box}
   */
  function Image() {}
  Image.prototype = new Box()
  Image.prototype.alt = function (s) {
    this[_e]["alt"] = s
  }
  Image.prototype.src = function (s) {
    this[_e]["src"] = s
  }

  /**
   * @constructor
   * @extends {Box}
   */
  function Text() {}
  Text.prototype = new Box()
  Text.prototype.sync = function (oCell) {
    var self = this
    self.bind([oCell], function (x) {
      self.value.set(x)
    })
    self.event([self.value], function (x) {
      oCell.set(x)
    })
  }

  /**
   * @constructor
   * @extends {Box}
   */
  function IFrame() {}
  IFrame.prototype = new Box()
  IFrame.prototype.src = Image.prototype.src
  IFrame.prototype.sandbox = function (s) {
    this[_e]["sandbox"] = s || ""
  }
  IFrame.prototype.seamless = function () {
    this[_e]["setAttribute"]("seamless", "") // TODO remove this later
    this[_e]["seamless"] = true
  }
  IFrame.prototype.getWindow = function () {
    return this[_e]["contentWindow"]
  }

  /**
   * @constructor
   * @extends {Box}
   */
  function Link() {}
  Link.prototype = new Box()
  Link.prototype.src = function (s) {
    this[_e]["href"] = s
  }
  Link.prototype.download = function (s) {
    this[_e]["download"] = s
  }
  Link.prototype.click = function () {
    this[_e]["click"]()
  }

  /**
   * @constructor
   * @extends {Box}
   */
  function File() {}
  File.prototype = new Box()
  File.prototype.accept = function (s) {
    this[_e]["accept"] = s
  }
  File.prototype.click = function () {
    this[_e]["click"]()
  }

  function remove(x) {
    var e = x[_e]
    if (e.removed) {
      x[_e] = null

      array.each(e[bindings], function (x) {
        x.unbind()
      })
      e[_e] = null
      e[bindings] = null
      // TODO I probably need to null out everything ?
      e.mouseclick = null
      e.mousedown = null
      e.mouseover = null
      e.value = null
    }
  }

  function make(constructor, o) {
    var e       = new constructor()
    o[_e]       = e
    e[_e]       = o
    e[bindings] = []
    e[_styles]  = {}

    // TODO maybe needs to bind the events even if the cell isn't bound
    // TODO if the window loses focus and refocuses, it doesn't update properly
    e.focused = cell.dedupe(false, {
      bind: function (self) {
        o["tabIndex"] = -1

        function focus() {
          self.set(document["hasFocus"]())
        }

        function blur() {
          self.set(false)
        }

        o["addEventListener"]("focus", focus, true)
        o["addEventListener"]("blur", blur, true)

        return {
          focus: focus,
          blur: blur
        }
      },
      unbind: function (e) {
        o["tabIndex"] = ""
        o["removeEventListener"]("focus", e.focus, true)
        o["removeEventListener"]("blur", e.blur, true)
      },
      set: function (self, b) {
        if (b) {
          o["focus"]()
        } else {
          o["blur"]()
        }
      }
    })

    // TODO closures
    e.mouseclick = cell.dedupe(undefined, {
      bind: function (self) {
        function click(e) {
          e["preventDefault"]()
          var oEvent = { left:   (e["button"] === 0)
                       , middle: (e["button"] === 1)
                       , right:  false
                       , mouseX: e["clientX"]
                       , mouseY: e["clientY"]
                       , shift:  e["shiftKey"]
                       , ctrl:   (e["ctrlKey"] || e["metaKey"])
                       , alt:    e["altKey"] }
          oEvent[_e] = e["target"]
          self.set(oEvent)
        }

        function contextmenu(e) {
          e["preventDefault"]()
          var oEvent = { left:   false
                       , middle: false
                       , right:  true
                       , mouseX: e["clientX"]
                       , mouseY: e["clientY"]
                       , shift:  e["shiftKey"]
                       , ctrl:   (e["ctrlKey"] || e["metaKey"])
                       , alt:    e["altKey"] }
          oEvent[_e] = e["target"]
          self.set(oEvent)
        }

        o["addEventListener"]("click", click, true)
        o["addEventListener"]("contextmenu", contextmenu, true)

        return {
          click: click,
          contextmenu: contextmenu
        }
      },
      unbind: function (e) {
        o["removeEventListener"]("click", e.click, true)
        o["removeEventListener"]("contextmenu", e.contextmenu, true)
      }
    })

    function makeSeen(seen, e) {
      var o    = {}
      o.left   = seen.left
      o.middle = seen.middle
      o.right  = seen.right
      o[_e]    = e
      return o
    }

    var seen = { left: false, middle: false, right: false }
                              // TODO is this correct?
    e.mousedown = cell.dedupe(makeSeen(seen, o), {
      bind: function (self) {
        function contextmenu(e) {
          e["preventDefault"]()
        }

        function mousedown(e) {
          if (e["button"] === 0) {
            seen.left = true
          } else if (e["button"] === 1) {
            seen.middle = true
          } else if (e["button"] === 2) {
            seen.right = true
          }
          self.set(makeSeen(seen, e["target"]))

          addEventListener("mouseup", function anon(f) {
            if (f["button"] === e["button"]) {
              removeEventListener("mouseup", anon, true)
              if (e["button"] === 0) {
                seen.left = false
              } else if (e["button"] === 1) {
                seen.middle = false
              } else if (e["button"] === 2) {
                seen.right = false
              }
              self.set(makeSeen(seen, e["target"]))
            }
          }, true)
        }

        // TODO blur
        o["addEventListener"]("contextmenu", contextmenu, true)
        o["addEventListener"]("mousedown", mousedown, true)

        return {
          contextmenu: contextmenu,
          mousedown: mousedown
        }
      },
      unbind: function (e) {
        o["removeEventListener"]("contextmenu", e.contextmenu, true)
        o["removeEventListener"]("mousedown", e.mousedown, true)
      }
    })

    e.mouseover = cell.dedupe(false, {
      bind: function (self) {
        function mouseover(e) {
          if (isOver(o, e)) {
            var oEvent = { mouseX: e["clientX"], mouseY: e["clientY"] }
            oEvent[_e] = e["target"] // TODO why is this here?
            self.set(oEvent)
          }
        }

        function mouseout(e) {
          if (isOver(o, e)) {
            self.set(false)
          }
        }

        // TODO blur
        o["addEventListener"]("mouseover", mouseover, true)
        o["addEventListener"]("mouseout", mouseout, true)

        return {
          mouseover: mouseover,
          mouseout: mouseout
        }
      },
      unbind: function (e) {
        o["removeEventListener"]("mouseover", e.mouseover, true)
        o["removeEventListener"]("mouseout", e.mouseout, true)
      }
    })

    return e
  }

  function call(f, e) {
    if (f != null) {
      f(e)
    }
    return e
  }

  addRule(document, "[hidden]", function (o) {
    o["setProperty"]("display", "none", "important")
  })

  /*addRule(document, ".clip *", function (o) {
    o.overflow = "hidden"
    o.textOverflow = "ellipsis"
  })*/

  // TODO replace these with util.dom.style ?
  addRule(document, "[data-box]", function (o) {
    o["MozBoxSizing"] = "border-box" // TODO
    o["boxSizing"] = "border-box"

    o["margin"] = "0px"
    o["padding"] = "0px"

    //o.whiteSpace = "pre-wrap" // TODO

    o["backgroundColor"] = "transparent"

    // TODO I wish there was a way to get rid of these two
    o["borderWidth"] = "0px"
    o["borderColor"] = "transparent"
    o["borderStyle"] = "solid"

    o["outlineWidth"] = "0px"
    o["outlineStyle"] = "solid"

    o["flexGrow"] = "0"
    o["flexShrink"] = "0" // "1"
    o["flexBasis"] = "auto" // TODO try out other stuff like min-content once it becomes available

    o["position"] = "relative"

    o["backgroundSize"] = "100% 100%"

    o["cursor"] = "inherit"

    o["verticalAlign"] = "middle" // TODO I can probably get rid of this

    //o.verticalAlign = "top" // TODO needed in Firefox
    //o.tableLayout = "fixed"
    //o.backgroundClip = "padding-box" // TODO content-box
  })

  /*addRule(document, ".horiz > *", function (o) {
    o.display = "inline-block"
    //o.cssFloat = "left"
    //o.padding = "0px"
    o.height = "100%"
    //o.whiteSpace = "normal"
    //o.width = "100%"
  })*/

  /*addRule(document, ".vert > *", function (o) {

    //o.width = "100%"
  })*/

  addRule(document, "[data-body]", function (o) {
    o["cursor"] = "default"
  })

  addRule(document, "[data-separator]", function (o) {
    o["height"] = "1px"
    o["marginTop"] = o["marginBottom"] = "0.5em"
    o["backgroundColor"] = "rgb(238, 238, 238)"
  })

  addRule(document, "[data-button]", function (o) {
    o["outline"] = "none"
    o["cursor"] = "pointer"
  })

  // TODO code duplication with horiz
  addRule(document, "[data-label]", function (o) {
    o["display"] = "flex"
    o["flexDirection"] = "row"
    o["alignItems"] = "center"
  })

  addRule(document, "[data-list]", function (o) {
    o["outline"] = "none"
    //o.display = "block"
    /*o.position = "relative"
    o.top = "-2px"*/
  })

  addRule(document, "[data-table]", function (o) {
    o["borderSpacing"] = "0px"
  })

  addRule(document, "[data-text]", function (o) {
    o["cursor"] = "auto"
  })

  addRule(document, "[data-search]", function (o) {
    o["border"] = "none"
    o["outline"] = "none"
    //o.margin = "0px"

    o["cursor"] = "auto"

    //o.backgroundColor = "white"
    //o.color = "black"
  })

  util.dom.horiz = util.dom.style(function (e) {
    e.set("display", "flex")
    e.set("flex-direction", "row")
    e.set("align-items", "center")
  })

  util.dom.vert = util.dom.style(function (e) {
    e.set("display", "flex")
    e.set("flex-direction", "column")
  })

  util.dom.panel = util.dom.style(function (e) {
    e.set("position", "absolute")
    e.set("z-index", highestZIndex)
  })

  util.dom.fixedPanel = util.dom.style(function (e) {
    e.set("position", "fixed")
    e.set("z-index", highestZIndex)
  })

  util.dom.shrink = util.dom.style(function (e) {
    // e.set("display", "inline-block")
    e.set("flex-shrink", "1")
  })

  util.dom.clip = util.dom.style(function (e) {
    e.set("flex-shrink", "1")
    e.set("overflow", "hidden")
    e.set("text-overflow", "ellipsis")
  })

  util.dom.stretch = util.dom.style(function (e) {
    e.set("flex-shrink", "1")
    e.set("flex-grow", "1")
    e.set("flex-basis", "0%")
  })

  util.dom.initialize = function (f) {
    document["body"]["dataset"]["box"] = ""
    document["body"]["dataset"]["body"] = ""

    addRule(document, "html, body", function (o) {
      //o.margin = "0px"
      o["width"] = "100%"
      o["height"] = "100%"
    })

    /*addRule(document, "*", function (o) {
      //o.textOverflow = "ellipsis"

      //o.overflow = "hidden"
      //o.textOverflow = "ellipsis"
      //o.minWidth = "0px"
      //o.minHeight = "0px"
      //o.whiteSpace = "pre"
    })*/

    new MutationObserver(function (a) {
      array.each(a, function (x) {
        if (x["type"] === "childList") {
          array.each(x["removedNodes"], function (x) {
            if (_e in x) {
              remove(x)
            }
          })
        }
      })
    })["observe"](document["body"], {
      "childList": true,
      "subtree": true
    })

    //var o = document.createElement("div")
    //o.className = "vert"
    //o.style.width = o.style.height = "100%"
    //document.body.appendChild(o)
    return call(f, make(Box, document["body"]))
  }

  /*function calculate(x) {
    var s, s2
    if (x[_e].className === "vert") {
      s  = "height"
      s2 = "offsetHeight"
    } else if (x[_e].className === "horiz") {
      s  = "width"
      s2 = "offsetWidth"
    } else {
      throw new Error("can only add elements to horiz or vert elements")
    }

    var size  = 0
      , elems = []
    ;[].forEach.call(x[_e].children, function (x) {
      if (x.style[s] === "") {
        elems.push(x)
      } else {
        size += x[s2]
      }
    })

    var len = calc((100 / elems.length) + "%", "-", size + "px")
    console.log(len)
    elems.forEach(function (x) {
      x.style[s] = len
    })
  }*/

  util.dom.box = function (f) {
    var o = document["createElement"]("div")
    o["dataset"]["box"] = ""
    //calculate(x)
    return call(f, make(Box, o))
  }

  // TODO remove this ?
  util.dom.element = function (s, f) {
    var o = document["createElement"](s)
    o["dataset"]["box"] = ""
    return call(f, make(Box, o))
  }

  util.dom.label = function (f) {
    var o = document["createElement"]("label")
    o["dataset"]["box"] = ""
    o["dataset"]["label"] = ""
    return call(f, make(Box, o))
  }

  util.dom.separator = function (f) {
    var o = document["createElement"]("hr")
    o["dataset"]["box"] = ""
    o["dataset"]["separator"] = ""
    return call(f, make(Box, o))
  }

  util.dom.checkbox = function (f) {
    var o = document["createElement"]("input")
    o["dataset"]["box"] = ""
    o["type"] = "checkbox"

    var e = make(Box, o)

    // TODO closure
    e.changed = cell.value(undefined, {
      bind: function (self) {
        function change() {
          self.set(o["checked"])
        }

        o["addEventListener"]("change", change, true)

        return {
          change: change
        }
      },
      unbind: function (e) {
        o["removeEventListener"]("change", e.change, true)
      }
    })

    // indeterminate has priority
    // TODO closure
    // TODO should <cell>.get() trigger <cell>bind() ?
    // TODO maybe this can ignore duplicates ?
    e.checked = cell.value(o["indeterminate"] ? null : o["checked"], {
      bind: function (self) {
        // TODO is this correct; does it leak; is it inefficient; can it be replaced with cell.map ?
        return e.event([e.changed], function (b) {
          self.set(o["indeterminate"] ? null : b)
        })
      },
      unbind: function (e) {
        e.unbind()
      },
      set: function (self, x) {
        if (x === null) {
          o["checked"] = false
          o["indeterminate"] = true
        } else {
          o["checked"] = x
          o["indeterminate"] = false
        }
      }
    })

    return call(f, e)
  }

  util.dom.radio = function (f) {
    var o = document["createElement"]("input")
    o["dataset"]["box"] = ""
    o["type"] = "radio"

    var e = make(Box, o)

    // TODO closure
    e.changed = cell.value(undefined, {
      bind: function (self) {
        function change() {
          self.set(o["checked"])
        }

        o["addEventListener"]("change", change, true)

        return {
          change: change
        }
      },
      unbind: function (e) {
        o["removeEventListener"]("change", e.change, true)
      }
    })

    // indeterminate has priority
    // TODO code duplication with checkbox
    // TODO closure
    // TODO should <cell>.get() trigger <cell>bind() ?
    // TODO maybe this can ignore duplicates ?
    e.checked = cell.value(o["indeterminate"] ? null : o["checked"], {
      bind: function (self) {
        // TODO is this correct; does it leak; is it inefficient; can it be replaced with cell.map ?
        return e.event([e.changed], function (b) {
          self.set(o["indeterminate"] ? null : b)
        })
      },
      unbind: function (e) {
        e.unbind()
      },
      set: function (self, x) {
        if (x === null) {
          o["checked"] = false
          o["indeterminate"] = true
        } else {
          o["checked"] = x
          o["indeterminate"] = false
        }
      }
    })

    return call(f, e)
  }

  util.dom.list = function (f) {
    var o = document["createElement"]("select")
    o["dataset"]["box"] = ""
    o["dataset"]["list"] = ""

    var e = make(Box, o)

    // TODO closure
    // TODO maybe this can ignore duplicates
    e.changed = cell.value(undefined, {
      bind: function (self) {
        function change() {
          //var x = o.options[o.selectedIndex]
          self.set(o["value"])
        }

        o["addEventListener"]("change", change, true)

        return {
          change: change
        }
      },
      unbind: function (e) {
        o["removeEventListener"]("change", e.change, true)
      }
    })

    return call(f, e)
  }

  util.dom.listItem = function (f) {
    var o = document["createElement"]("option")
    o["dataset"]["box"] = ""
    return call(f, make(ListItem, o))
  }

  util.dom.listGroup = function (f) {
    var o = document["createElement"]("optgroup")
    o["dataset"]["box"] = ""
    return call(f, make(ListGroup, o))
  }

  util.dom.search = function (f) {
    var o = document["createElement"]("input")
    o["dataset"]["box"] = ""
    o["dataset"]["search"] = ""
    o["type"] = "search"
    o["incremental"] = true
    o["autocomplete"] = "off"
    o["placeholder"] = "Search"
    o["setAttribute"]("results", "")
    //calculate(x)

    var e = make(Text, o)

    // TODO closure
    e.value = cell.dedupe(o["value"], {
      bind: function (self) {
        function search() {
          self.set(o["value"])
        }

        o["addEventListener"]("search", search, true)

        return {
          search: search
        }
      },
      unbind: function (e) {
        o["removeEventListener"]("search", e.search, true)
      },
      set: function (self, x) {
        o["value"] = x
      }
    })

    return call(f, e)
  }

  util.dom.textbox = function (f) {
    var o = document["createElement"]("input")
    o["dataset"]["box"] = ""
    o["dataset"]["text"] = ""
    o["type"] = "text"

    var e = make(Text, o)

    // TODO closure
    // TODO code duplication
    e.changed = cell.value(undefined, {
      bind: function (self) {
        function change() {
          e.value.set(o["value"]) // TODO why is this here ?
          self.set(o["value"])
        }

        o["addEventListener"]("change", change, true)

        return {
          change: change
        }
      },
      unbind: function (e) {
        o["removeEventListener"]("change", e.change, true)
      }
    })

    // TODO closure
    // TODO code duplication
    // TODO should <cell>.get() trigger <cell>bind() ?
    e.value = cell.dedupe(o["value"], {
      // TODO is all this stuff necessary ?
      bind: function (self) {
        // TODO is this correct; does it leak; is it inefficient; can it be replaced with cell.map ?
        return e.event([e.changed], function (x) {
          self.set(x)
        })
      },
      unbind: function (e) {
        e.unbind()
      },
      set: function (self, x) {
        o["value"] = x
      }
    })

    return call(f, e)
  }

  util.dom.textarea = function (f) {
    var o = document["createElement"]("textarea")
    o["dataset"]["box"] = ""

    var e = make(Text, o)

    // TODO closure
    // TODO code duplication
    e.value = cell.dedupe(o["value"], {
      bind: function (self) {
        function input() {
          self.set(o["value"])
        }

        o["addEventListener"]("input", input, true)

        return {
          input: input
        }
      },
      unbind: function (e) {
        o["removeEventListener"]("input", e.input, true)
      },
      set: function (self, x) {
        o["value"] = x
      }
    })

    return call(f, e)
  }

  util.dom.link = function (f) {
    var o = document["createElement"]("a")
    o["dataset"]["box"] = ""
    return call(f, make(Link, o))
  }

  util.dom.iframe = function (f) {
    var o = document["createElement"]("iframe")
    o["dataset"]["box"] = ""
    return call(f, make(IFrame, o))
  }

  util.dom.file = function (f) {
    var o = document["createElement"]("input")
    o["dataset"]["box"] = ""
    o["type"] = "file"

    o["addEventListener"]("error", function (e) {
      assert(false, e)
    }, true)

    var e = make(File, o)

    // TODO closure
    e.changed = cell.value(undefined, {
      bind: function (self) {
        function change(e) {
          var x = new FileReader()
          x["onerror"] = x["onabort"] = function (e) {
            assert(false, e)
          }
          x["onload"] = function (e) {
            self.set(e["target"]["result"])
          }
          x["readAsText"](e["target"]["files"][0])
        }

        o["addEventListener"]("change", change, true)

        return {
          change: change
        }
      },
      unbind: function (e) {
        o["removeEventListener"]("change", e.change, true)
      }
    })

    return call(f, e)
  }

  util.dom.image = function (f) {
    var o = document["createElement"]("img")
    o["dataset"]["box"] = ""
    //calculate(x)
    return call(f, make(Image, o))
  }

  util.dom.button = function (f) {
    var o = document["createElement"]("button")
    o["dataset"]["box"] = ""
    o["dataset"]["button"] = ""
    return call(f, make(Box, o))
  }

  util.dom.table = function (f) {
    var o = document["createElement"]("table")
    o["dataset"]["box"] = ""
    o["dataset"]["table"] = ""
    return call(f, make(Box, o))
  }

  util.dom.row = function (f) {
    var o = document["createElement"]("tr")
    o["dataset"]["box"] = ""
    return call(f, make(Box, o))
  }

  util.dom.cell = function (f) {
    var o = document["createElement"]("td")
    o["dataset"]["box"] = ""
    return call(f, make(Table, o))
  }

  // TODO multi-platform, e.g. -webkit, -moz, etc.
  /**
   * @param {...(number|string)} var_args
   * @return {string}
   */
  util.dom.calc = function (var_args) {
    return "calc(" + array.join(arguments, " ") + ")"
  }

  // TODO multi-platform, e.g. -webkit, -moz, etc.
  /**
   * @param {string} x
   * @param {...!Array.<string>} var_args
   */
  util.dom.gradient = function (x, var_args) {
    var r = [x]
    array.each(array.slice(arguments, 1), function (a) {
      array.push(r, a[1] + " " + a[0])
    })
    return "linear-gradient(" + array.join(r, ",") + ")"
  }

  // TODO multi-platform, e.g. -webkit, -moz, etc.
  /**
   * @param {string} x
   * @param {...!Array.<string>} var_args
   */
  util.dom.repeatingGradient = function (x, var_args) {
    var r = [x]
    array.each(array.slice(arguments, 1), function (a) {
      array.push(r, a[1] + " " + a[0])
    })
    return "repeating-linear-gradient(" + array.join(r, ",") + ")"
  }

  /**
   * @param {number} hue
   * @param {number} sat
   * @param {number} light
   * @param {number=} alpha
   * @return {string}
   */
  util.dom.hsl = function (hue, sat, light, alpha) {
    if (alpha == null) {
      alpha = 1
    }
    if (alpha === 1) {
      return "hsl(" + hue + ", " + sat + "%, " + light + "%)"
    } else {
      return "hsla(" + hue + ", " + sat + "%, " + light + "%, " + alpha + ")"
    }
  }

  util.dom.textStroke = function (color, blur) {
    return array.join(["-1px -1px " + blur + " " + color,
                       "-1px  1px " + blur + " " + color,
                       " 1px -1px " + blur + " " + color,
                       " 1px  1px " + blur + " " + color], ",")
  }

  // TODO not completely ideal, but it's the best I've come up with so far...
  util.dom.exclude = function (x, e) {
    return cell.filter(x.get(), x, function (x) {
      return !x || !e[_e]["contains"](x[_e])
    })
  }

  util.dom.title = function (s) {
    document["title"] = s
  }

  util.dom.width = function () {
    return document["documentElement"]["offsetWidth"]
  }

  util.dom.height = function () {
    return document["documentElement"]["offsetHeight"]
  }
})