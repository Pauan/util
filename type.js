goog.provide("util.type")

goog.scope(function () {
  /**
   * @type {function():string}
   */
  var type = {}.toString

  /**
   * @param {string} s
   * @return {function(*):boolean}
   */
  function typer(s) {
    return function (x) {
      return type.call(x) === s
    }
  }

  util.type.isString = typer("[object String]")
  util.type.isArray  = typer("[object Array]")
})
