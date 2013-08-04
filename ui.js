// TODO search for uses of "webkit" and remove when I can
define(["./name", "./cell"], function (name, cell) {
  "use strict";

  function join(a, i, s) {
    return [].slice.call(a, i).join(s == null ? " " : s)
  }

  var highestZIndex = "2147483647" /* 32-bit signed int */

  var element  = new name.Name()
    , bindings = new name.Name()
    , actions  = new name.Name()
    , id       = new name.Name()

  function isOver(self, e) {
    return !self.contains(e.relatedTarget)
  }

  /*function makeSet(Block, name, s) {
    Block.prototype[name] = function (s2) {
      this[element].style[s] = s2
    }
  }

  function makeJoin(Block, name, s, s2) {
    Block.prototype[name] = function () {
      this[element].style[s] = join(arguments, 0, s2)
    }
  }*/

  var ruleId = 0

  function Rule() {
    var self = this

    self[actions] = []
    self[id]      = "__rule__" + (++ruleId)

    addRule(document, "." + self[id], function (o) {
      self[element] = o
    })
  }
  Rule.prototype.width = function (s) {
    // TODO necessary due to flexbox
    this[element].minWidth = this[element].maxWidth = s
  }
  Rule.prototype.height = function (s) {
    // TODO necessary due to flexbox
    this[element].minHeight = this[element].maxHeight = s
  }
  // TODO maybe remove these two
  Rule.prototype.maxWidth = function (s) {
    this[element].maxWidth = s
  }
  Rule.prototype.maxHeight = function (s) {
    this[element].maxHeight = s
  }
  Rule.prototype.scrollbars = function () {
    this[element].overflow = "auto"
  }
  Rule.prototype.order = function (s) {
    this[element].order = s
  }
  Rule.prototype.opacity = function (s) {
    this[element].opacity = s
  }
  Rule.prototype.cursor = function (s) {
    this[element].cursor = s
  }
  Rule.prototype.stretch = function () {
    this[element].flexGrow = "1"
    this[element].flexShrink = "1"
    this[element].flexBasis = "0%"
  }
  Rule.prototype.filter = function (s) {
    // TODO
    this[element].webkitFilter = s
  }
  Rule.prototype.rule = function (s) {
    this[actions].push(function (x) {
      x.classList.add(s[id])
    })
  }

  Rule.prototype.autofocus = function () {
    this[actions].push(function (x) {
      x.autofocus = true
    })
  }
  Rule.prototype.stopDragging = function () {
    this[actions].push(function (x) {
      console.log(x)
      x.addEventListener("mousedown", function (e) {
        if (e.target.localName !== "input"/* && !e.target.draggable*/) {
          e.preventDefault()
        }
      }, true)
    })
  }

  // TODO closure
  function makeBorderSide(style, name) {
    return function (f) {
      f({
        size: function (s) {
          style[name + "Width"] = s
        },
        color: function (s) {
          style[name + "Color"] = s
        },
        remove: function () {
          style[name] = "none"
        }
      })
    }
  }

  // TODO closure
  function makeBorderCorner(style, name) {
    return function (f) {
      f({
        rounded: function (s) {
          style[name + "Radius"] = s
        }
      })
    }
  }

  // TODO closure
  Rule.prototype.border = function (f) {
    var style = this[element]
    f({
      top: makeBorderSide(style, "borderTop"),
      right: makeBorderSide(style, "borderRight"),
      bottom: makeBorderSide(style, "borderBottom"),
      left: makeBorderSide(style, "borderLeft"),
      topRight: makeBorderCorner(style, "borderTopRight"),
      topLeft: makeBorderCorner(style, "borderTopLeft"),
      bottomRight: makeBorderCorner(style, "borderBottomRight"),
      bottomLeft: makeBorderCorner(style, "borderBottomLeft"),
      rounded: function (s) {
        style.borderRadius = s
      },
      size: function (s) {
        style.borderWidth = s
      },
      color: function (s) {
        style.borderColor = s
      },
      remove: function () {
        style.border = "none"
      }
    })
  }

  // TODO closure
  Rule.prototype.move = function (f) {
    var style = this[element]
    style.position = "relative"
    f({
      left: function (s) {
        style.left = s
      },
      top: function (s) {
        style.top = s
      },
      right: function (s) {
        style.right = s
      },
      bottom: function (s) {
        style.bottom = s
      }
    })
  }

  // TODO closure
  Rule.prototype.padding = function (f) {
    var style = this[element]
    f({
      left: function (s) {
        style.paddingLeft = s
      },
      top: function (s) {
        style.paddingTop = s
      },
      right: function (s) {
        style.paddingRight = s
      },
      bottom: function (s) {
        style.paddingBottom = s
      },
      vertical: function (s) {
        style.paddingTop = style.paddingBottom = s
      },
      horizontal: function (s) {
        style.paddingLeft = style.paddingRight = s
      }
    })
  }

  // TODO closure
  Rule.prototype.panel = function (f) {
    var style = this[element]
    style.position = "fixed"
    style.zIndex = highestZIndex
    f({
      left: function (s) {
        style.left = s
      },
      top: function (s) {
        style.top = s
      },
      right: function (s) {
        style.right = s
      },
      bottom: function (s) {
        style.bottom = s
      }
    })
  }

  // TODO closure
  Rule.prototype.text = function (f) {
    var style = this[element]
    f({
      font: function () {
        style.fontFamily = join(arguments, 0, ",")
      },
      size: function (s) {
        if (arguments.length > 1) {
          throw new Error() // TODO
        }
        style.fontSize = s
      },
      ellipsis: function () {
        style.textOverflow = "ellipsis"
        style.overflow = "hidden"
      },
      weight: function (s) {
        style.fontWeight = s
      },
      color: function (s) {
        style.color = s
      },
      shadow: function (f) {
        var left  = []
          , top   = []
          , blur  = []
          , color = []
          , r     = []
        f({
          left: function () {
            left = [].slice.call(arguments)
          },
          top: function () {
            top = [].slice.call(arguments)
          },
          blur: function () {
            blur = [].slice.call(arguments)
          },
          color: function () {
            color = [].slice.call(arguments)
          },
          remove: function () {
            left  = []
            top   = []
            blur  = []
            color = []
            r     = ["none"]
          }
        })
        while (left.length || top.length || blur.length || color.length) {
          r.push((left.pop() || "0px") + " " +
                 (top.pop()  || "0px") + " " +
                 (blur.pop() || "0px") + " " +
                 color.pop())
        }
        style.textShadow = r.join(",")
      }
    })
  }

  // TODO closure
  Rule.prototype.background = function (f) {
    var style = this[element]
    f({
      color: function (s) {
        if (arguments.length > 1) {
          throw new Error() // TODO
        }
        style.backgroundColor = s
      },
      position: function (f) {
        var left = []
          , top  = []
        f({
          left: function () {
            left = [].slice.call(arguments)
          },
          top: function () {
            top = [].slice.call(arguments)
          }
        })
        var r = []
        while (left.length || top.length) {
          r.push((left.pop() || "0px") + " " +
                 (top.pop()  || "0px"))
        }
        style.backgroundPosition = r.join(",")
      },
      image: function () {
        style.backgroundImage = join(arguments, 0, ",")
      },
      gradient: function (x) {
        var r = [x]
        ;[].slice.call(arguments, 1).forEach(function (a) {
          r.push(a[1] + " " + a[0])
        })
        // TODO
        return "-webkit-linear-gradient(" + r.join(",") + ")"
      },
      repeatingGradient: function (x) {
        var r = [x]
        ;[].slice.call(arguments, 1).forEach(function (a) {
          r.push(a[1] + " " + a[0])
        })
        // TODO
        return "-webkit-repeating-linear-gradient(" + r.join(",") + ")"
      }
    })
  }

  // TODO size
  // TODO closure
  Rule.prototype.shadow = function (f) {
    var style = this[element]
      , inset = []
      , left  = []
      , top   = []
      , blur  = []
      , color = []
      , r     = []
    f({
      inset: function () {
        inset = [].slice.call(arguments)
      },
      left: function () {
        left = [].slice.call(arguments)
      },
      top: function () {
        top = [].slice.call(arguments)
      },
      blur: function () {
        blur = [].slice.call(arguments)
      },
      color: function () {
        color = [].slice.call(arguments)
      },
      remove: function () {
        inset = []
        left  = []
        top   = []
        blur  = []
        color = []
        r     = ["none"]
      }
    })
    while (inset.length || left.length || top.length || blur.length || color.length) {
      r.push((inset.pop() ? "inset " : "") +
             (left.pop() || "0px") + " " +
             (top.pop()  || "0px") + " " +
             (blur.pop() || "0px") + " " +
             color.pop())
    }
    style.boxShadow = r.join(",")
  }

  // TODO closure
  Rule.prototype.transition = function (f) {
    var style = this[element]
    f({
      duration: function () {
        style.transitionDuration = join(arguments, 0, ",")
      },
      property: function () {
        style.transitionProperty = join(arguments, 0, ",")
      },
      timingFunction: function () {
        style.transitionTimingFunction = join(arguments, 0, ",")
      }
    })
  }

  // TODO closure
  function Block(o) {
    this[element]  = o
    this[bindings] = []

    /*this.mouseclick = cell.value(undefined, {
      bind: function (self) {
        o.addEventListener("click", function (e) {
          self.set()
        }, true)
      }
    })*/
    this.mouseclick = cell.value(undefined, {
      bind: function (self) {
        function click(e) {
          e.preventDefault()
          var oEvent = { left:   (e.button === 0)
                       , middle: (e.button === 1)
                       , right:  false }
          oEvent[element] = e.target
          self.set(oEvent)
        }

        function contextmenu(e) {
          e.preventDefault()
          var oEvent = { left:   false
                       , middle: false
                       , right:  true }
          oEvent[element] = e.target
          self.set(oEvent)
        }

        o.addEventListener("click", click, true)
        o.addEventListener("contextmenu", contextmenu, true)

        return {
          click: click,
          contextmenu: contextmenu
        }
      },
      unbind: function (e) {
        o.removeEventListener("click", e.click, true)
        o.removeEventListener("contextmenu", e.contextmenu, true)
      }
    })

    var seen = { left: false, middle: false, right: false }
    seen[element] = o // TODO is this correct?
    this.mousedown = cell.value(seen, {
      bind: function (self) {
        function contextmenu(e) {
          e.preventDefault()
        }

        function mousedown(e) {
          if (e.button === 0) {
            seen.left = true
          } else if (e.button === 1) {
            seen.middle = true
          } else if (e.button === 2) {
            seen.right = true
          }
          seen[element] = e.target
          self.set(seen)

          addEventListener("mouseup", function anon(f) {
            if (f.button === e.button) {
              removeEventListener("mouseup", anon, true)
              if (e.button === 0) {
                seen.left = false
              } else if (e.button === 1) {
                seen.middle = false
              } else if (e.button === 2) {
                seen.right = false
              }
              seen[element] = e.target
              self.set(seen)
            }
          }, true)
        }

        // TODO blur
        o.addEventListener("contextmenu", contextmenu, true)
        o.addEventListener("mousedown", mousedown, true)

        return {
          contextmenu: contextmenu,
          mousedown: mousedown
        }
      },
      unbind: function (e) {
        o.removeEventListener("contextmenu", e.contextmenu, true)
        o.removeEventListener("mousedown", e.mousedown, true)
      }
    })

    this.mouseover = cell.value(false, {
      bind: function (self) {
        function mouseover(e) {
          if (isOver(o, e)) {
            var oEvent = { mouseX: e.clientX, mouseY: e.clientY }
            oEvent[element] = e.target
            self.set(oEvent)
          }
        }

        function mouseout(e) {
          if (isOver(o, e)) {
            self.set(false)
          }
        }

        // TODO blur
        o.addEventListener("mouseover", mouseover, true)
        o.addEventListener("mouseout", mouseout, true)

        return {
          mouseover: mouseover,
          mouseout: mouseout
        }
      },
      unbind: function (e) {
        o.removeEventListener("mouseover", e.mouseover, true)
        o.removeEventListener("mouseout", e.mouseout, true)
      }
    })
  }
  /*makeSet(Block, "cursor", "cursor")
  makeSet(Block, "backgroundColor", "backgroundColor")
  makeSet(Block, "textColor", "color")
  makeSet(Block, "opacity", "opacity")
  makeSet(Block, "fontWeight", "fontWeight")
  makeSet(Block, "transitionDuration", "transitionDuration")
  makeSet(Block, "transitionProperty", "transitionProperty")
  makeSet(Block, "transitionTimingFunction", "transitionTimingFunction")
  makeSet(Block, "order", "order")
  makeSet(Block, "top", "top")
  makeSet(Block, "bottom", "bottom")
  makeSet(Block, "left", "left")
  makeSet(Block, "right", "right")

  makeJoin(Block, "stretch", "flex")
  makeJoin(Block, "borderRadius", "borderRadius")
  makeJoin(Block, "backgroundPosition", "backgroundPosition")
  makeJoin(Block, "filter", "webkitFilter")
  makeJoin(Block, "borderColor", "borderColor")
  makeJoin(Block, "backgroundSize", "backgroundSize") // TODO automatically do this for certain properties

  makeJoin(Block, "boxShadow", "boxShadow", ", ")
  makeJoin(Block, "backgroundImage", "backgroundImage", ", ")
  makeJoin(Block, "textShadow", "textShadow", ", ")*/


  Block.prototype.text = function (s) {
    this[element].textContent = s || ""
  }

  Block.prototype.remove = function () {
    if (this[element].parentNode) {
      this[element].parentNode.removeChild(this[element])
    }
  }

  Block.prototype.bind = function (a, f) {
    this[bindings].push(cell.lift(a, f))
  }
  Block.prototype.on = function (a, f) {
    this[bindings].push(cell.event(a, f))
  }

  Block.prototype.title = function (s) {
    this[element].title = s
  }
  Block.prototype.hide = function () {
    this[element].hidden = true
  }
  Block.prototype.show = function () {
    this[element].hidden = false
  }

  /*
  Block.prototype.roundedCorners = function (info) {
    if (info.topLeft != null) {
      this[element].style.borderTopLeftRadius = info.topLeft
    }
    if (info.topRight != null) {
      this[element].style.borderTopRightRadius = info.topRight
    }
    if (info.bottomLeft != null) {
      this[element].style.borderBottomLeftRadius = info.bottomLeft
    }
    if (info.bottomRight != null) {
      this[element].style.borderBottomRightRadius = info.bottomRight
    }
  }*/

  Block.prototype.getPosition = function () {
    return this[element].getBoundingClientRect()
  }

  Block.prototype.rule = function () {
    var self = this[element]
    self.className = [].map.call(arguments, function (x) {
      x[actions].forEach(function (f) {
        f(self)
      })
      return x[id]
    }).join(" ")
  }

  Block.prototype.ruleIf = function (b, s) {
    if (b) {
      this[element].classList.add(s[id])
    } else {
      this[element].classList.remove(s[id])
    }
  }

  // TODO closure
  function Search(o) {
    Block.call(this, o)
    this.value = cell.value(o.value, {
      bind: function (self) {
        console.log("HIYA")

        function search() {
          self.set(o.value)
        }

        o.addEventListener("search", search, true)

        return {
          search: search
        }
      },
      unbind: function (e) {
        o.removeEventListener("search", e.search, true)
      },
      set: function (self, x) {
        o.value = x
      }
    })
  }
  Search.prototype = new Block()

  function Image(o) {
    Block.call(this, o)
  }
  Image.prototype = new Block()
  Image.prototype.src = function (s) {
    this[element].src = s
  }

  function call(constructor, o, f) {
    var e = new constructor(o)
    if (f != null) {
      f(e)
    }
    return e
  }

  function append(constructor, parent, o, f) {
    var e = new constructor(o)
    o[element] = e
    if (f != null) {
      f(e)
    }
    parent[element].appendChild(o)
    return e
  }

  function addRule(document, s, f) {
    var e = document.createElement("style")
    e.type = "text/css"
    document.head.appendChild(e)

    var sheet = document.styleSheets[document.styleSheets.length - 1]
    sheet.addRule(s)

    return f(sheet.cssRules[sheet.cssRules.length - 1].style)
  }

  function normalize(document, f) {
    document.body.dataset.direction = "vert"

    addRule(document, "html, body", function (o) {
      o.margin = "0px"
      o.height = "100%"
    })

    addRule(document, "[hidden]", function (o) {
      o.setProperty("display", "none", "important")
    })

    addRule(document, "*", function (o) {
      //o.boxSizing = "border-box"
      // TODO I wish there was a way to get rid of these two
      o.borderWidth = "0px"
      o.borderColor = "transparent"
      o.borderStyle = "solid"
      o.whiteSpace = "pre"
      o.backgroundSize = "100% 100%"
      //o.flexGrow = "0"
      //o.flexShrink = "0"
      //o.flexBasis = "auto"
      o.tableLayout = "fixed"
    })

    addRule(document, "input[type=search]", function (o) {
      o.border = "none"
      o.outline = "none"
      o.margin = "0px"
    })

    addRule(document, "[data-direction='horiz']", function (o) {
      o.display = "table"
      //o.display = "flex"
      //o.flexDirection = "row"
    })

    addRule(document, "[data-direction='horiz'] > *", function (o) {
      o.display = "table-cell"
    })

    addRule(document, "[data-direction='vert']", function (o) {
      o.display = "flex"
      o.flexDirection = "column"
    })

    new MutationObserver(function (a) {
      a.forEach(function (x) {
        if (x.type === "childList") {
          ;[].forEach.call(x.removedNodes, function (x) {
            if (element in x) {
              var y = x[element]
              y[bindings].forEach(function (x) {
                x.unbind()
              })
              //delete this.mouseclick
              //delete this.mousedown
              //delete this.mouseover
              delete x[element]
              delete y[element]
              delete y[bindings]
            }/* else {
              console.log(x)
              console.dir(x)
            }*/
          })
        }
      })
    }).observe(document, {
      childList: true,
      subtree: true,
    })

    return call(Block, document.body, f)
  }

  function horiz(x, f) {
    var o = document.createElement("div")
    //o.style.minWidth = o.style.minHeight = "auto"
    o.dataset.direction = "horiz"
    return append(Block, x, o, f)
  }

  function vert(x, f) {
    var o = document.createElement("div")
    //o.style.minWidth = o.style.minHeight = "auto"
    o.dataset.direction = "vert"
    return append(Block, x, o, f)
  }

  function search(x, f) {
    var o = document.createElement("input")
    o.type = "search"
    o.incremental = true
    o.autocomplete = "off"
    o.setAttribute("results", "")
    return append(Search, x, o, f)
  }

  function image(x, f) {
    var o = document.createElement("img")
    return append(Image, x, o, f)
  }

  function div(x, f) {
    var o = document.createElement("div")
    return append(Block, x, o, f)
  }

  function span(x, f) {
    var o = document.createElement("span")
    return append(Block, x, o, f)
  }

  function calc() {
    // TODO
    return "-webkit-calc(" + join(arguments, 0) + ")"
  }

  // TODO not completely ideal, but it's the best I've come up with so far...
  function exclude(x, e) {
    return cell.filter(x.get(), x, function (x) {
      return !x || !e[element].contains(x[element])
    })
  }

  function rule(f) {
    var o = new Rule()
    f(o)
    return o
  }

  return Object.create({
    normalize: normalize,
    horiz: horiz,
    vert: vert,
    search: search,
    image: image,
    div: div,
    span: span,
    highestZIndex: highestZIndex,
    calc: calc,
    exclude: exclude,
    rule: rule,
  })
})
