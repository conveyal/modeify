
var bind = require('event').bind
  , indexOf = require('indexof');


/**
 * Expose `onEscape`.
 */

module.exports = exports = onEscape;


/**
 * Handlers.
 */

var fns = [];


/**
 * Escape binder.
 *
 * @param {Function} fn
 */

function onEscape (fn) {
  fns.push(fn);
}


/**
 * Bind a handler, for symmetry.
 */

exports.bind = onEscape;


/**
 * Unbind a handler.
 *
 * @param {Function} fn
 */

exports.unbind = function (fn) {
  var index = indexOf(fns, fn);
  if (index !== -1) fns.splice(index, 1);
};


/**
 * Bind to `document` once.
 */

bind(document, 'keydown', function (e) {
  if (27 !== e.keyCode) return;
  for (var i = 0, fn; fn = fns[i]; i++) fn(e);
});