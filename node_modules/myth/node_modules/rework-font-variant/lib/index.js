
var properties = require('./properties');


/**
 * Expose `plugin`.
 */

module.exports = plugin;


/**
 * Convert `font-variant-*` properties into their open-type equivalents.
 *
 * @param {Object} stylesheet
 */

function plugin (stylesheet) {
  stylesheet.rules.forEach(function (rule) {
    if (!rule.declarations) return;
    var decs = [];
    rule.declarations.forEach(function (dec, i) {
      var value = variant(dec.property, dec.value);
      if (value) decs.push(value);
      decs.push(dec);
    });
    rule.declarations = decs;
  });
}


/**
 * Convert a `font-variant-*` property.
 *
 * @param {String} property
 * @param {String} value
 */

function variant (property, value) {
  if (!properties[property]) return null;

  var features = 'font-variant' == property
    ? shorthand(value)
    : properties[property][value]
      ? properties[property][value]
      : value;

  return {
    type: 'declaration',
    property: 'font-feature-settings',
    value: features
  };
}


/**
 * Convert the `font-variant` shorthand property.
 *
 * @param {String} value
 */

function shorthand (value) {
  var values = value.split(/\s+/g);
  return values.map(function (val) {
    return properties['font-variant'][val];
  }).join(', ');
}