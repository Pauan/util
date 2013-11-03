define(["./name", "./cell"], function (name, oCell) {
  "use strict";

  function join(a, i, s) {
    return [].slice.call(a, i).join(s == null ? " " : s)
  }

  var highestZIndex = "2147483647" /* 32-bit signed int */

  var _e       = new name.Name()
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
      this[_e].style[s] = s2
    }
  }

  function makeJoin(Block, name, s, s2) {
    Block.prototype[name] = function () {
      this[_e].style[s] = join(arguments, 0, s2)
    }
  }*/

  // TODO closure
  function makeBorderSide(name) {
    return function (f) {
      var style = this[_e].style
      f({
        style: function (s) {
          style[name + "Style"] = s
        },
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
      var style = this[_e].style
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
      this[_e].style.borderRadius = s
    },
    style: function (s) {
      this[_e].style.borderStyle = s
    },
    size: function (s) {
      this[_e].style.borderWidth = s
    },
    color: function (s) {
      this[_e].style.borderColor = s
    },
    remove: function () {
      this[_e].style.border = "none"
    }
  }

  var styleMove = {
    left: function (s) {
      this[_e].style.left = s
    },
    top: function (s) {
      this[_e].style.top = s
    },
    right: function (s) {
      this[_e].style.right = s
    },
    bottom: function (s) {
      this[_e].style.bottom = s
    }
  }

  var stylePadding = {
    all: function (s) {
      this[_e].style.padding = s
    },
    left: function (s) {
      this[_e].style.paddingLeft = s
    },
    top: function (s) {
      this[_e].style.paddingTop = s
    },
    right: function (s) {
      this[_e].style.paddingRight = s
    },
    bottom: function (s) {
      this[_e].style.paddingBottom = s
    },
    vertical: function (s) {
      this[_e].style.paddingTop = this[_e].style.paddingBottom = s
    },
    horizontal: function (s) {
      this[_e].style.paddingLeft = this[_e].style.paddingRight = s
    }
  }
  
  var styleMargin = {
    all: function (s) {
      this[_e].style.margin = s
    },
    left: function (s) {
      this[_e].style.marginLeft = s
    },
    top: function (s) {
      this[_e].style.marginTop = s
    },
    right: function (s) {
      this[_e].style.marginRight = s
    },
    bottom: function (s) {
      this[_e].style.marginBottom = s
    },
    vertical: function (s) {
      this[_e].style.marginTop = this[_e].style.marginBottom = s
    },
    horizontal: function (s) {
      this[_e].style.marginLeft = this[_e].style.marginRight = s
    }
  }

  /*var stylePanel = {
    left: function (s) {
      this[_e].style.left = s
    },
    top: function (s) {
      this[_e].style.top = s
    },
    right: function (s) {
      this[_e].style.right = s
    },
    bottom: function (s) {
      this[_e].style.bottom = s
    }
  }*/

  var styleFont = {
    align: function (s) {
      this[_e].style.textAlign = s
    },
    letterSpacing: function (s) {
      this[_e].style.letterSpacing = s
    },
    variant: function (s) {
      this[_e].style.fontVariant = s
    },
    font: function () {
      this[_e].style.fontFamily = join(arguments, 0, ",")
    },
    size: function (s) {
      if (arguments.length > 1) {
        throw new Error() // TODO
      }
      this[_e].style.fontSize = s
    },
    weight: function (s) {
      this[_e].style.fontWeight = s
    },
    color: function (s) {
      this[_e].style.color = s
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
      this[_e].style.textShadow = r.join(",")
    }
  }

  var styleBackground = {
    attachment: function (s) {
      this[_e].style.backgroundAttachment = s
    },
    repeat: function (s) {
      this[_e].style.backgroundRepeat = s
    },
    color: function (s) {
      if (arguments.length > 1) {
        throw new Error() // TODO
      }
      this[_e].style.backgroundColor = s
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
      this[_e].style.backgroundPosition = r.join(",")
    },
    image: function () {
      this[_e].style.backgroundImage = join(arguments, 0, ",")
    }
  }

  var styleTransition = {
    duration: function () {
      this[_e].style.transitionDuration = join(arguments, 0, ",")
    },
    property: function () {
      this[_e].style.transitionProperty = join(arguments, 0, ",")
    },
    timingFunction: function () {
      this[_e].style.transitionTimingFunction = join(arguments, 0, ",")
    }
  }
  
  //var animations = []

  var Box = {
    addText: function (s) {
      this[_e].appendChild(document.createTextNode(s || ""))
    },
    previous: function () {
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
    },
    dom: function () {
      return this[_e]
    },
    /*nextElement: function () {
      return this[_e].nextElementChild[_e]
    },*/
    transform: function (s) {
      this[_e].style.transform = s
    },
    stretch: function () {
      this[_e].style.flexGrow = "1"
      this[_e].style.flexShrink = "1"
      this[_e].style.flexBasis = "0%"
    },
    width: function (s) {
      //this[_e].style.width = s
      // TODO necessary due to tables
      this[_e].style.width/* = this[_e].style.minWidth = this[_e].style.maxWidth */= s
    },
    height: function (s) {
      //this[_e].style.height = s
      // TODO necessary due to tables
      this[_e].style.height/* = this[_e].style.minHeight = this[_e].style.maxHeight */= s
    },
    // TODO maybe remove these two
    maxWidth: function (s) {
      this[_e].style.maxWidth = s
    },
    maxHeight: function (s) {
      this[_e].style.maxHeight = s
    },
    scrollbars: function () {
      this[_e].style.overflow = "auto"
    },
    opacity: function (s) {
      this[_e].style.opacity = s
    },
    cursor: function (s) {
      this[_e].style.cursor = s
    },
    filter: function (s) {
      // TODO
      this[_e].style.webkitFilter = s
    },
    autofocus: function () {
      this[_e].autofocus = true
    },
    stopDragging: function () {
      this[_e].addEventListener("mousedown", function (e) {
        if (e.target.localName !== "input"/* && !e.target.draggable*/) {
          e.preventDefault()
        }
      }, true)
    },
    move: function (e) {
      e[_e].appendChild(this[_e])
    },
    moveBefore: function (e, x) {
      if (x) {
        e[_e].insertBefore(this[_e], x[_e])
      } else {
        e[_e].appendChild(this[_e])
      }
    },
    /*replace: function (e) {
      e[_e].parentNode.replaceChild(this[_e], e[_e])
    },*/
    /*getChildren: function () {
      // TODO inefficient
      return [].filter.call(this[_e].children, function (x) {
        return _e in x
      }).map(function (x) {
        return x[_e]
      })
    },*/

    border: function (f) {
      var o = Object.create(styleBorder)
      o[_e] = this[_e]
      f(o)
    },
    position: function (f) {
      var o = Object.create(styleMove)
      o[_e] = this[_e]
      f(o)
    },
    overflow: function (s) {
      this[_e].style.overflow = s
    },
    padding: function (f) {
      var o = Object.create(stylePadding)
      o[_e] = this[_e]
      f(o)
    },
    margin: function (f) {
      var o = Object.create(styleMargin)
      o[_e] = this[_e]
      f(o)
    },
    /*panel: function (f) {
      var o = Object.create(stylePanel)
      o[_e] = this[_e]
      this[_e].style.position = "fixed"
      this[_e].style.zIndex = highestZIndex
      f(o)
    },*/
    font: function (f) {
      var o = Object.create(styleFont)
      o[_e] = this[_e]
      f(o)
    },
    background: function (f) {
      var o = Object.create(styleBackground)
      o[_e] = this[_e]
      f(o)
    },
    transition: function (f) {
      var o = Object.create(styleTransition)
      o[_e] = this[_e]
      f(o)
    },

    // TODO size
    // TODO closure
    shadow: function (f) {
      var inset = []
        , left  = []
        , top   = []
        , blur  = []
        , size  = []
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
        size: function () {
          size = [].slice.call(arguments)
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
      while (inset.length || left.length || top.length || blur.length || size.length || color.length) {
        r.push((inset.pop() ? "inset " : "") +
               (left.pop() || "0px") + " " +
               (top.pop()  || "0px") + " " +
               (blur.pop() || "0px") + " " +
               (size.pop() || "0px") + " " +
               color.pop())
      }
      this[_e].style.boxShadow = r.join(",")
    },

    text: function (s) {
      this[_e].textContent = s || ""
    },
    remove: function () {
      this.removed = true
      var self = this[_e]
      if (self.parentNode) {
        self.parentNode.removeChild(self)
      }
    },
    bind: function (a, f) {
      var o = oCell.bind(a, f)
      this[bindings].push(o)
      return o
    },
    event: function (a, f) {
      var o = oCell.event(a, f)
      this[bindings].push(o)
      return o
    },
    title: function (s) {
      this[_e].title = s
    },
    isHidden: function () {
      return this[_e].hidden
    },
    hide: function () {
      this[_e].hidden = true
    },
    show: function () {
      this[_e].hidden = false
    },
    getPosition: function () {
      return this[_e].getBoundingClientRect()
    }
  }
  
  var ListItem = Object.create(Box)
  ListItem.select = function () {
    this[_e].selected = true
  }
  ListItem.value = function (s) {
    this[_e].value = s
  }
  
  var Table = Object.create(Box)
  Table.align = function (s) {
    this[_e].style.verticalAlign = s
  }

  var Image = Object.create(Box)
  Image.src = function (s) {
    this[_e].src = s
  }
  
  var Link = Object.create(Box)
  Link.src = function (s) {
    this[_e].href = s
  }
  Link.download = function (s) {
    this[_e].download = s
  }
  Link.click = function () {
    this[_e].click()
  }
  
  var File = Object.create(Box)
  File.accept = function (s) {
    this[_e].accept = s
  }
  File.click = function () {
    this[_e].click()
  }

  var Panel = Object.create(Box)
  Panel.left = function (s) {
    this[_e].style.left = s
  }
  Panel.right = function (s) {
    this[_e].style.right = s
  }
  Panel.top = function (s) {
    this[_e].style.top = s
  }
  Panel.bottom = function (s) {
    this[_e].style.bottom = s
  }

  function remove(x) {
    var e = x[_e]
    if (e.removed) {
      x[_e] = null

      e[bindings].forEach(function (x) {
        x.unbind()
      })
      e[_e] = null
      e[bindings] = null
      e.mouseclick = null
      e.mousedown = null
      e.mouseover = null
      e.value = null
    }
  }

  function make(constructor, o) {
    var e = Object.create(constructor)
    o[_e]       = e
    e[_e]       = o
    e[bindings] = []

    // TODO closures
    e.mouseclick = oCell.dedupe(undefined, {
      bind: function (self) {
        function click(e) {
          e.preventDefault()
          var oEvent = { left:   (e.button === 0)
                       , middle: (e.button === 1)
                       , right:  false
                       , mouseX: e.clientX
                       , mouseY: e.clientY
                       , shift:  e.shiftKey
                       , ctrl:   (e.ctrlKey || e.metaKey)
                       , alt:    e.altKey }
          oEvent[_e] = e.target
          self.set(oEvent)
        }

        function contextmenu(e) {
          e.preventDefault()
          var oEvent = { left:   false
                       , middle: false
                       , right:  true
                       , mouseX: e.clientX
                       , mouseY: e.clientY
                       , shift:  e.shiftKey
                       , ctrl:   (e.ctrlKey || e.metaKey)
                       , alt:    e.altKey }
          oEvent[_e] = e.target
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
    e.mousedown = oCell.dedupe(makeSeen(seen, o), {
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
          self.set(makeSeen(seen, e.target))

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
              self.set(makeSeen(seen, e.target))
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

    e.mouseover = oCell.dedupe(false, {
      bind: function (self) {
        function mouseover(e) {
          if (isOver(o, e)) {
            var oEvent = { mouseX: e.clientX, mouseY: e.clientY }
            oEvent[_e] = e.target // TODO why is this here?
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
      o.position = "relative"

      o.margin = "0px"
      o.padding = "0px"
      
      o.MozBoxSizing = "border-box" // TODO
      o.boxSizing = "border-box"
      
      o.backgroundSize = "100% 100%"
      o.textOverflow = "ellipsis"
      //o.overflow = "hidden"
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
    
    addRule(document, "input[type=checkbox]", function (o) {
      o.position = "relative"
      o.top = "-1px"
      //o.marginRight = "3px"
      o.verticalAlign = "middle"
    })
    
    addRule(document, "select", function (o) {
      o.outline = "none"
      o.display = "block"
      /*o.position = "relative"
      o.top = "-2px"*/
      o.verticalAlign = "middle"
    })
    
    addRule(document, "table", function (o) {
      o.borderSpacing = "0px"
    })
    
    addRule(document, "button", function (o) {
      o.outline = "none"
      o.verticalAlign = "middle"
      o.cursor = "pointer"
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
            if (_e in x) {
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
  
  function element(s, f) {
    var o = document.createElement(s)
    o.className = "box"
    return call(f, make(Box, o))
  }
  
  function label(f) {
    var o = document.createElement("label")
    o.className = "box"
    return call(f, make(Box, o))
  }
  
  function checkbox(f) {
    var o = document.createElement("input")
    o.className = "box"
    o.type = "checkbox"
    
    var e = make(Box, o)
    
    // TODO closure
    e.changed = oCell.value(undefined, {
      bind: function (self) {
        function change() {
          self.set(o.checked)
        }

        o.addEventListener("change", change, true)

        return {
          change: change
        }
      },
      unbind: function (e) {
        o.removeEventListener("change", e.change, true)
      }
    })
    
    // indeterminate has priority
    // TODO closure
    // TODO should <cell>.get() trigger <cell>bind() ?
    // TODO maybe this can ignore duplicates ?
    e.checked = oCell.value(o.indeterminate ? null : o.checked, {
      bind: function (self) {
        // TODO is this correct; does it leak; is it inefficient; can it be replaced with cell.map ?
        return e.event([e.changed], function (b) {
          self.set(o.indeterminate ? null : b)
        })
      },
      unbind: function (e) {
        e.unbind()
      },
      set: function (self, x) {
        if (x === null) {
          o.checked = false
          o.indeterminate = true
        } else {
          o.checked = x
          o.indeterminate = false
        }
      }
    })

    return call(f, e)
  }
  
  function list(f) {
    var o = document.createElement("select")
    o.className = "box"
    
    var e = make(Box, o)
    
    // TODO closure
    // TODO maybe this can ignore duplicates
    e.changed = oCell.value(undefined, {
      bind: function (self) {
        function change() {
          //var x = o.options[o.selectedIndex]
          self.set(o.value)
        }
        
        o.addEventListener("change", change, true)
        
        return {
          change: change
        }
      },
      unbind: function (e) {
        o.removeEventListener("change", e.change, true)
      }
    })
    
    return call(f, e)
  }
  
  function listItem(f) {
    var o = document.createElement("option")
    o.className = "box"
    return call(f, make(ListItem, o))
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
    e.value = oCell.dedupe(o.value, {
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

    return call(f, e)
  }
  
  function textbox(f) {
    var o = document.createElement("input")
    o.className = "box"
    o.type = "text"
    
    var e = make(Box, o)
    
    // TODO closure
    // TODO code duplication
    e.value = oCell.dedupe(o.value, {
      bind: function (self) {
        function input() {
          self.set(o.value)
        }
        
        o.addEventListener("change", input, true)
        
        return {
          input: input
        }
      },
      unbind: function (e) {
        o.removeEventListener("change", input, true)
      },
      set: function (self, x) {
        o.value = x
      }
    })
    
    return call(f, e)
  }
  
  function link(f) {
    var o = document.createElement("a")
    o.className = "box"
    return call(f, make(Link, o))
  }
  
  function file(f) {
    var o = document.createElement("input")
    o.className = "box"
    o.type = "file"
    
    o.addEventListener("error", function (e) {
      console.log(e)
      alert("Error: " + JSON.stringify(e))
    }, true)
    
    var e = make(File, o)
    
    // TODO closure
    e.changed = oCell.value(undefined, {
      bind: function (self) {
        function change(e) {
          var x = new FileReader()
          x.onerror = x.onabort = function (e) {
            console.log(e)
            alert("Error: " + JSON.stringify(e))
          }
          x.onload = function (e) {
            self.set(e.target.result)
          }
          x.readAsText(e.target.files[0])
        }
        
        o.addEventListener("change", change, true)
        
        return {
          change: change
        }
      },
      unbind: function (e) {
        o.removeEventListener("change", e.change, true)
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
  
  function inlinePanel(f) {
    var o = document.createElement("div")
    o.className = "box"
    o.style.position = "absolute"
    return call(f, make(Panel, o))
  }
  
  function button(f) {
    var o = document.createElement("button")
    o.className = "box"
    return call(f, make(Box, o))
  }
  
  function table(f) {
    var o = document.createElement("table")
    o.className = "box"
    return call(f, make(Box, o))
  }
  
  function row(f) {
    var o = document.createElement("tr")
    o.className = "box"
    return call(f, make(Box, o))
  }
  
  function cell(f) {
    var o = document.createElement("td")
    o.className = "box"
    return call(f, make(Table, o))
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
    return oCell.filter(x.get(), x, function (x) {
      return !x || !e[_e].contains(x[_e])
    })
  }
  
  function width() {
    return document.documentElement.offsetWidth
  }
  
  function height() {
    return document.documentElement.offsetHeight
  }
  
  // TODO rename addRule to stylesheet then get rid of this
  function stylesheet(s, f) {
    return addRule(document, s, f)
  }

  return Object.create({
    gradient: gradient,
    repeatingGradient: repeatingGradient,
    calc: calc,
    exclude: exclude,
    //highestZIndex: highestZIndex,
    
    stylesheet: stylesheet,

    normalize: normalize,
    box: box,
    horiz: horiz,
    vert: vert,
    search: search,
    textbox: textbox,
    label: label,
    checkbox: checkbox,
    image: image,
    panel: panel,
    inlinePanel: inlinePanel,
    element: element,
    list: list,
    listItem: listItem,
    button: button,
    link: link,
    file: file,
    
    table: table,
    row: row,
    cell: cell,
    
    width: width,
    height: height,
  })
})
