/** @const @dict @type {function (new:Object, *=): ?} */
function Object() {}
Object.prototype = {}

/** @const @dict @type {function (new:String, *=): string} */
function String() {}

/** @const @dict @type {function (new:RegExp, *=, *=): RegExp} */
function RegExp() {}

/** @const @dict @type {function (new:Error, *=, *=, *=): Error} */
function Error() {}

/** @const @dict @type {function (new:Date, ?=, ?=, ?=, ?=, ?=, ?=, ?=): string}*/
function Date() {}

/** @const @dict @constructor */
function FileReader() {}

/** @const @dict @constructor */
function MutationObserver(x) {}

/** @const @dict @constructor */
function Node() {}

/** @const @dict @constructor */
function Arguments() {}


/** @const @dict */
var Math = {}

/** @const @dict */
var console = {}

/** @const @dict */
var screen = {}

/** @const @dict */
var document = {}

/** @const @dict */
var performance = {}


/** @const */
var NaN

/** @const @type {!Arguments} */
var arguments

/** @const @type {undefined} */
var undefined

/** @const */
function addEventListener(s, f, b) {}

/** @const */
function removeEventListener(s, f, b) {}
