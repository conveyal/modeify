
var balanced = require('balanced-match');
var color = require('css-color-function');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Plugin to convert CSS color functions.
 *
 * @param {Object} stylesheet
 */

function plugin(stylesheet){
  stylesheet.rules.forEach(rule);
}

/**
 * Convert a `rule`.
 *
 * @param {Object} rule
 */

function rule(obj){
  if (obj.declarations) obj.declarations.forEach(declaration);
  if (obj.rules) obj.rules.forEach(rule);
  if (obj.keyframes) obj.keyframes.forEach(rule);
}

/**
 * Convert a `dec`.
 *
 * @param {Object} dec
 */

function declaration(dec){
  if (!dec.value) return;
  try {
    dec.value = convert(dec.value);
  } catch (err) {
    err.position = dec.position;
    throw err;
  }
}

/**
 * Convert any color functions in a CSS property value `string` into their RGBA
 * equivalent.
 *
 * @param {String} string
 * @return {String}
 */

function convert(string){
  var index = string.indexOf('color(');
  if (index == -1) return string;

  var fn = string.slice(index);
  var ret = balanced('(', ')', fn);
  if (!ret) throw new SyntaxError('Missing closing parentheses');
  fn = 'color(' + ret.body + ')';

  return string.slice(0, index) + color.convert(fn) + convert(ret.post);
}