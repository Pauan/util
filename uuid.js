// Blatantly stolen from <https://github.com/broofa/node-uuid>

//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

// TODO test that this works correctly
// TODO use a separate "./rand" module
"use strict";

var rand = (typeof crypto !== "undefined" && crypto.getRandomValues
             ? (function () {
                 var buffer = new Uint8Array(16)
                 return function () {
                   crypto.getRandomValues(buffer)
                   return buffer
                 }
               })()
             : (function () {
                 var buffer = new Array(16)
                 return function () {
                   for (var i = 0, r; i < 16; i++) {
                     if ((i & 0x03) === 0) {
                       r = Math.random() * 0x100000000
                     }
                     buffer[i] = r >>> ((i & 0x03) << 3) & 0xff;
                   }
                   return buffer
                 }
               })())

var byteToHex = []
  , hexToByte = {}
for (var i = 0; i < 256; i++) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
  hexToByte[byteToHex[i]] = i
}

function unparse(buf, offset) {
  var i   = offset || 0
    , bth = byteToHex
  return  bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]]
}

function v4() {
  var a = rand()
  a[6] = (a[6] & 0x0f) | 0x40
  a[8] = (a[8] & 0x3f) | 0x80
  return unparse(a)
  /*return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0
      , v = (c == "x" ? r : ((r & 0x3) | 0x8))
    return v.toString(16)
  })*/
}
exports.v4 = v4