
var convert = require('rgb');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Hex alpha pattern matcher.
 */

var pattern = /(#[0-9a-f]{4}(?:[0-9a-f]{4})?)\b/i;

/**
 * Plugin to convert hex colors with alpha values into their RGBA equivalents
 * for more browser support.
 *
 * @param {Object} stylesheet
 */

function plugin(stylesheet){
  stylesheet.rules.forEach(rule);
}

/**
 * Convert a rule.
 *
 * @param {Object} obj
 * @param {Number} i
 */

function rule(obj, i){
  if (obj.declarations) obj.declarations.forEach(declaration);
  if (obj.rules) obj.rules.forEach(rule);
}

/**
 * Convert a declaration.
 *
 * @param {Object} obj
 * @param {Number} i
 */

function declaration(obj, i){
  var val = obj.value;
  if (!val) return;
  var m = pattern.exec(val);
  if (!m) return;

  var hex = m[1];
  var rgb = convert(hex);
  var i = val.indexOf(hex);
  var l = hex.length;
  obj.value = val.slice(0, i) + rgb + val.slice(i + l);
}