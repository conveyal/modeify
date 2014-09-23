/**
 * Module dependencies
 */

var debug = require('debug')('css:prop');
var camelcase = require('to-camel-case');
var vendor = require('./vendor');

/**
 * Export `prop`
 */

module.exports = prop;

/**
 * Normalize Properties
 */

var cssProps = {
  'float': 'cssFloat' in document.documentElement.style ? 'cssFloat' : 'styleFloat'
};

/**
 * Get the vendor prefixed property
 *
 * @param {String} prop
 * @param {String} style
 * @return {String} prop
 * @api private
 */

function prop(prop, style) {
  prop = cssProps[prop] || (cssProps[prop] = vendor(prop, style));
  debug('transform property: %s => %s', prop, style);
  return prop;
}
