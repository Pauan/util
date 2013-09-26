define(["./name", "./cell"], function (name, cell) {
  "use strict";

  function join(a, i, s) {
    return [].slice.call(a, i).join(s == null ? " " : s)
  }

  var highestZIndex = "2147483647" /* 32-bit signed int */

  var element  = new name.Name()
    , bindings = new name.Name()

  function isOver(self, e) {
    return !self.contains(e.relatedTarget)
  }

  function addRule(document, s, f) {
    var e = document.createElement("style")
    e.type = "text/css"
    document.head.appendChild(e)

    var sheet = document.styleSheets[document.styleSheets.length - 1]
    sheet.insertRule(s + "{}", sheet.cssRules.length) //sheet.addRule(s)

    return f(sheet.cssRules[sheet.cssRules.length - 1].style)
  }
  
  /*function testStyle(prop, a, s) {
    var e = document.createElement("div")
    for (var i = 0, iLen = a.length; i < iLen; ++i) {
      e.style[prop] = a[i] + s
      if (e.style[prop] === a[i] + s) {
        return a[i]
      }
    }
  }
  
  var calcStyle = testStyle("width",
                            ["calc",
                             "-webkit-calc"],
                            "(100%)")
  
  var linearGradientStyle = testStyle("backgroundImage",
                                      ["linear-gradient",
                                       "-webkit-linear-gradient"],
                                      "(blue, red)")

  var repeatingLinearGradientStyle = testStyle("backgroundImage",
                                               ["repeating-linear-gradient",
                                                "-webkit-repeating-linear-gradient"],
                                               "(blue, red)")
  
  var reverse = {
    "top": "bottom",
    "bottom": "top",
    "left": "right",
    "right": "left"
  }
  
  function reverseGradient(s, prop) {
    var a = s.split(/ +/)
    if (a[0] === "to" && /^\-webkit\-/.test(prop)) {
      return a.slice(1).map(function (x) {
        return reverse[x]
      }).join(" ")
    } else {
      return s
    }
  }
  
  console.log(calcStyle, linearGradientStyle, repeatingLinearGradientStyle)*/

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

  // TODO closure
  function makeBorderSide(name) {
    return function (f) {
      var style = this[element].style
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
  function makeBorderCorner(name) {
    return function (f) {
      var style = this[element].style
      f({
        rounded: function (s) {
          style[name + "Radius"] = s
        }
      })
    }
  }

  var styleBorder = {
    top: makeBorderSide("borderTop"),
    right: makeBorderSide("borderRight"),
    bottom: makeBorderSide("borderBottom"),
    left: makeBorderSide("borderLeft"),
    topRight: makeBorderCorner("borderTopRight"),
    topLeft: makeBorderCorner("borderTopLeft"),
    bottomRight: makeBorderCorner("borderBottomRight"),
    bottomLeft: makeBorderCorner("borderBottomLeft"),
    rounded: function (s) {
      this[element].style.borderRadius = s
    },
    size: function (s) {
      this[element].style.borderWidth = s
    },
    color: function (s) {
      this[element].style.borderColor = s
    },
    remove: function () {
      this[element].style.border = "none"
    }
  }

  var styleMove = {
    left: function (s) {
      this[element].style.left = s
    },
    top: function (s) {
      this[element].style.top = s
    },
    right: function (s) {
      this[element].style.right = s
    },
    bottom: function (s) {
      this[element].style.bottom = s
    }
  }

  var stylePadding = {
    all: function (s) {
      this[element].style.padding = s
    },
    left: function (s) {
      this[element].style.paddingLeft = s
    },
    top: function (s) {
      this[element].style.paddingTop = s
    },
    right: function (s) {
      this[element].style.paddingRight = s
    },
    bottom: function (s) {
      this[element].style.paddingBottom = s
    },
    vertical: function (s) {
      this[element].style.paddingTop = this[element].style.paddingBottom = s
    },
    horizontal: function (s) {
      this[element].style.paddingLeft = this[element].style.paddingRight = s
    }
  }
  
  var styleMargin = {
    all: function (s) {
      this[element].style.margin = s
    },
    left: function (s) {
      this[element].style.marginLeft = s
    },
    top: function (s) {
      this[element].style.marginTop = s
    },
    right: function (s) {
      this[element].style.marginRight = s
    },
    bottom: function (s) {
      this[element].style.marginBottom = s
    },
    vertical: function (s) {
      this[element].style.marginTop = this[element].style.marginBottom = s
    },
    horizontal: function (s) {
      this[element].style.marginLeft = this[element].style.marginRight = s
    }
  }

  /*var stylePanel = {
    left: function (s) {
      this[element].style.left = s
    },
    top: function (s) {
      this[element].style.top = s
    },
    right: function (s) {
      this[element].style.right = s
    },
    bottom: function (s) {
      this[element].style.bottom = s
    }
  }*/

  var styleFont = {
    font: function () {
      this[element].style.fontFamily = join(arguments, 0, ",")
    },
    size: function (s) {
      if (arguments.length > 1) {
        throw new Error() // TODO
      }
      this[element].style.fontSize = s
    },
    weight: function (s) {
      this[element].style.fontWeight = s
    },
    color: function (s) {
      this[element].style.color = s
    },
    // TODO closure
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
      this[element].style.textShadow = r.join(",")
    }
  }

  var styleBackground = {
    color: function (s) {
      if (arguments.length > 1) {
        throw new Error() // TODO
      }
      this[element].style.backgroundColor = s
    },
    // TODO closure
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
      this[element].style.backgroundPosition = r.join(",")
    },
    image: function () {
      this[element].style.backgroundImage = join(arguments, 0, ",")
    }
  }

  var styleTransition = {
    duration: function () {
      this[element].style.transitionDuration = join(arguments, 0, ",")
    },
    property: function () {
      this[element].style.transitionProperty = join(arguments, 0, ",")
    },
    timingFunction: function () {
      this[element].style.transitionTimingFunction = join(arguments, 0, ",")
    }
  }
  
  //var animations = []

  var Box = {
    previous: function () {
      var e = this[element].previousSibling
      while (true) {
        if (e) {
          if (element in e) {
            return e[element]
          } else {
            e = e.previousSibling
          }
        } else {
          return e
        }
      }
    },
    next: function () {
      var e = this[element].nextSibling
      while (true) {
        if (e) {
          if (element in e) {
            return e[element]
          } else {
            e = e.nextSibling
          }
        } else {
          return e
        }
      }
    },
    dom: function () {
      return this[element]
    },
    /*nextElement: function () {
      return this[element].nextElementChild[element]
    },*/
    transform: function (s) {
      this[element].style.transform = s
    },
    stretch: function () {
      this[element].style.flexGrow = "1"
      this[element].style.flexShrink = "1"
      this[element].style.flexBasis = "0%"
    },
    width: function (s) {
      //this[element].style.width = s
      // TODO necessary due to tables
      this[element].style.width/* = this[element].style.minWidth = this[element].style.maxWidth */= s
    },
    height: function (s) {
      //this[element].style.height = s
      // TODO necessary due to tables
      this[element].style.height/* = this[element].style.minHeight = this[element].style.maxHeight */= s
    },
    // TODO maybe remove these two
    maxWidth: function (s) {
      this[element].style.maxWidth = s
    },
    maxHeight: function (s) {
      this[element].style.maxHeight = s
    },
    scrollbars: function () {
      this[element].style.overflow = "auto"
    },
    opacity: function (s) {
      this[element].style.opacity = s
    },
    cursor: function (s) {
      this[element].style.cursor = s
    },
    filter: function (s) {
      // TODO
      this[element].style.webkitFilter = s
    },
    autofocus: function () {
      this[element].autofocus = true
    },
    stopDragging: function () {
      this[element].addEventListener("mousedown", function (e) {
        if (e.target.localName !== "input"/* && !e.target.draggable*/) {
          e.preventDefault()
        }
      }, true)
    },
    move: function (e) {
      e[element].appendChild(this[element])
    },
    moveBefore: function (e, x) {
      if (x) {
        e[element].insertBefore(this[element], x[element])
      } else {
        e[element].appendChild(this[element])
      }
    },
    replace: function (e) {
      e[element].parentNode.replaceChild(this[element], e[element])
    },
    /*getChildren: function () {
      // TODO inefficient
      return [].filter.call(this[element].children, function (x) {
        return element in x
      }).map(function (x) {
        return x[element]
      })
    },*/

    border: function (f) {
      var o = Object.create(styleBorder)
      o[element] = this[element]
      f(o)
    },
    position: function (f) {
      var o = Object.create(styleMove)
      o[element] = this[element]
      this[element].style.position = "relative"
      f(o)
    },
    padding: function (f) {
      var o = Object.create(stylePadding)
      o[element] = this[element]
      f(o)
    },
    margin: function (f) {
      var o = Object.create(styleMargin)
      o[element] = this[element]
      f(o)
    },
    /*panel: function (f) {
      var o = Object.create(stylePanel)
      o[element] = this[element]
      this[element].style.position = "fixed"
      this[element].style.zIndex = highestZIndex
      f(o)
    },*/
    font: function (f) {
      var o = Object.create(styleFont)
      o[element] = this[element]
      f(o)
    },
    background: function (f) {
      var o = Object.create(styleBackground)
      o[element] = this[element]
      f(o)
    },
    transition: function (f) {
      var o = Object.create(styleTransition)
      o[element] = this[element]
      f(o)
    },

    // TODO size
    // TODO closure
    shadow: function (f) {
      var inset = []
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
      this[element].style.boxShadow = r.join(",")
    },

    text: function (s) {
      this[element].textContent = s || ""
    },
    remove: function () {
      this.removed = true
      var self = this[element]
      if (self.parentNode) {
        self.parentNode.removeChild(self)
      }
    },
    bind: function (a, f) {
      var o = cell.bind(a, f)
      this[bindings].push(o)
      return o
    },
    event: function (a, f) {
      var o = cell.event(a, f)
      this[bindings].push(o)
      return o
    },
    title: function (s) {
      this[element].title = s
    },
    isHidden: function () {
      return this[element].hidden
    },
    hide: function () {
      this[element].hidden = true
    },
    show: function () {
      this[element].hidden = false
    },
    getPosition: function () {
      return this[element].getBoundingClientRect()
    }
  }

  var Image = Object.create(Box)
  Image.src = function (s) {
    this[element].src = s
  }

  var Panel = Object.create(Box)
  Panel.left = function (s) {
    this[element].style.left = s
  }
  Panel.right = function (s) {
    this[element].style.right = s
  }
  Panel.top = function (s) {
    this[element].style.top = s
  }
  Panel.bottom = function (s) {
    this[element].style.bottom = s
  }

  function remove(x) {
    var e = x[element]
    if (e.removed) {
      x[element] = null

      e[bindings].forEach(function (x) {
        x.unbind()
      })
      e[element] = null
      e[bindings] = null
      e.mouseclick = null
      e.mousedown = null
      e.mouseover = null
      e.value = null
    }
  }

  function make(constructor, o) {
    var e = Object.create(constructor)
    o[element]  = e
    e[element]  = o
    e[bindings] = []

    // TODO closures
    e.mouseclick = cell.value(undefined, {
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
    e.mousedown = cell.value(seen, {
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

    e.mouseover = cell.value(false, {
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

    return e
  }

  function call(f, e) {
    if (f != null) {
      f(e)
    }
    return e
  }

  function normalize(document, f) {
    document.body.className = "vert"

    addRule(document, "html, body", function (o) {
      //o.margin = "0px"
      o.width = "100%"
      o.height = "100%"
      
      o.cursor = "default"
    })
    
    addRule(document, "*", function (o) {
      o.margin = "0px"
      o.padding = "0px"
      
      o.MozBoxSizing = "border-box" // TODO
      o.boxSizing = "border-box"
      
      o.backgroundSize = "100% 100%"
      o.textOverflow = "ellipsis"
      o.overflow = "hidden"
    })

    addRule(document, "[hidden]", function (o) {
      o.setProperty("display", "none", "important")
    })

    addRule(document, "input[type=search]", function (o) {
      o.border = "none"
      o.outline = "none"
      //o.margin = "0px"
      
      o.cursor = "auto"
      
      // TODO
      o.backgroundColor = "white"
      o.color = "black"
    })

    addRule(document, ".box", function (o) {
      o.whiteSpace = "pre" // TODO

      // TODO I wish there was a way to get rid of these two
      o.borderWidth = "0px"
      o.borderColor = "transparent"
      o.borderStyle = "solid"

      o.flexGrow = "0"
      o.flexShrink = "0"
      o.flexBasis = "auto"

      //o.verticalAlign = "top" // TODO needed in Firefox
      //o.tableLayout = "fixed"
      //o.backgroundClip = "padding-box" // TODO content-box
    })

    addRule(document, ".horiz", function (o) {
      o.display = "flex"
      o.flexDirection = "row"
      //o.alignItems = "center"
      //o.display = "inline-block"
      //o.cssFloat = "left"
      //o.display = "table"
      //o.display = "flex"
      //o.flexDirection = "row"
    })

    /*addRule(document, ".horiz > *", function (o) {
      o.display = "inline-block"
      //o.cssFloat = "left"
      //o.padding = "0px"
      o.height = "100%"
      //o.whiteSpace = "normal"
      //o.width = "100%"
    })*/

    /*addRule(document, ".vert", function (o) {
      o.display = "flex"
      o.flexDirection = "column"
      //o.display = "table"
      //o.display = "flex"
      //o.flexDirection = "column"
    })*/

    /*addRule(document, ".vert > *", function (o) {

      //o.width = "100%"
    })*/

    addRule(document, ".panel", function (o) {
      o.position = "fixed"
      o.zIndex = highestZIndex
    })

    new MutationObserver(function (a) {
      a.forEach(function (x) {
        if (x.type === "childList") {
          ;[].forEach.call(x.removedNodes, function (x) {
            if (element in x) {
              remove(x)
            }
          })
        }
      })
    }).observe(document.body, {
      childList: true,
      subtree: true,
    })

    //var o = document.createElement("div")
    //o.className = "vert"
    //o.style.width = o.style.height = "100%"
    //document.body.appendChild(o)
    return call(f, make(Box, document.body))
  }

  /*function calculate(x) {
    var s, s2
    if (x[element].className === "vert") {
      s  = "height"
      s2 = "offsetHeight"
    } else if (x[element].className === "horiz") {
      s  = "width"
      s2 = "offsetWidth"
    } else {
      throw new Error("can only add elements to horiz or vert elements")
    }

    var size  = 0
      , elems = []
    ;[].forEach.call(x[element].children, function (x) {
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

  function box(f) {
    var o = document.createElement("div")
    o.className = "box"
    //calculate(x)
    return call(f, make(Box, o))
  }

  function horiz(f) {
    var o = document.createElement("div")
    o.className = "box horiz"
    //calculate(x)
    return call(f, make(Box, o))
  }

  function vert(f) {
    var o = document.createElement("div")
    o.className = "box vert"
    //calculate(x)
    return call(f, make(Box, o))
  }

  function search(f) {
    var o = document.createElement("input")
    o.className = "box"
    o.type = "search"
    o.incremental = true
    o.autocomplete = "off"
    o.setAttribute("results", "")
    //calculate(x)

    var e = make(Box, o)

    // TODO closure
    e.value = cell.value(o.value, {
      bind: function (self) {
        console.log("HIYA")

        function search() {
          self.set(o.value)
        }

        // TODO should use "search" event
        o.addEventListener("keyup", search, true)

        return {
          search: search
        }
      },
      unbind: function (e) {
        o.removeEventListener("keyup", e.search, true)
      },
      set: function (self, x) {
        o.value = x
      }
    })

    return call(f, e)
  }

  function image(f) {
    var o = document.createElement("img")
    o.className = "box"
    //calculate(x)
    return call(f, make(Image, o))
  }

  function panel(f) {
    var o = document.createElement("div")
    o.className = "box panel"
    document.body.appendChild(o)
    return call(f, make(Panel, o))
  }

  function calc() {
    return "calc(" + join(arguments, 0) + ")"
  }

  function gradient(x) {
    var r = [x]
    ;[].slice.call(arguments, 1).forEach(function (a) {
      r.push(a[1] + " " + a[0])
    })
    return "linear-gradient(" + r.join(",") + ")"
  }

  function repeatingGradient(x) {
    var r = [x]
    ;[].slice.call(arguments, 1).forEach(function (a) {
      r.push(a[1] + " " + a[0])
    })
    return "repeating-linear-gradient(" + r.join(",") + ")"
  }

  // TODO not completely ideal, but it's the best I've come up with so far...
  function exclude(x, e) {
    return cell.filter(x.get(), x, function (x) {
      return !x || !e[element].contains(x[element])
    })
  }
  
  function width() {
    return document.documentElement.offsetWidth
  }
  
  function height() {
    return document.documentElement.offsetHeight
  }

  return Object.create({
    gradient: gradient,
    repeatingGradient: repeatingGradient,
    calc: calc,
    exclude: exclude,
    //highestZIndex: highestZIndex,

    normalize: normalize,
    box: box,
    horiz: horiz,
    vert: vert,
    search: search,
    image: image,
    panel: panel,
    
    width: width,
    height: height,
  })
})
