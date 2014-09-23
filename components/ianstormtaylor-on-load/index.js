
var callback = require('callback');


/**
 * Expose `onLoad`.
 */

module.exports = onLoad;


/**
 * Handlers.
 */

var fns = [];


/**
 * Loaded tester.
 */

var loaded = /loaded|complete/;


/**
 * Callback when the document is load.
 *
 * @param {Function} fn
 */

function onLoad (fn) {
  loaded.test(document.readyState) ? callback.async(fn) : fns.push(fn);
}


/**
 * Bind to load.
 */

document.addEventListener('DOMContentLoaded', function () {
  var fn;
  while (fn = fns.shift()) fn();
});