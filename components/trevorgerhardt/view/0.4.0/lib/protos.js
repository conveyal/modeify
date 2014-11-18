
var Classes = require('classes');
var Emitter = require('emitter');


/**
 * Mixin emitter.
 */

Emitter(exports);


/**
 * Mixin classes.
 */

Classes(exports);


/**
 * Convenience shortcut for `querySelector`.
 *
 * @param {String} selector
 * @return {Element or Null}
 */

exports.find = function (selector) {
  return this.el.querySelector(selector);
};


/**
 * Convenient shortcut for `querySelectorAll`.
 *
 * @param {String} selector
 * @return {NodeList or Null}
 */

exports.findAll = function (selector) {
  return this.el.querySelectorAll(selector);
};