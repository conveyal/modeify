/**
 * Module Dependencies
 */

var debug = require('debug')('css:style');
var camelcase = require('to-camel-case');
var support = require('./support');
var property = require('./prop');
var hooks = require('./hooks');

/**
 * Expose `style`
 */

module.exports = style;

/**
 * Possibly-unitless properties
 *
 * Don't automatically add 'px' to these properties
 */

var cssNumber = {
  "columnCount": true,
  "fillOpacity": true,
  "fontWeight": true,
  "lineHeight": true,
  "opacity": true,
  "order": true,
  "orphans": true,
  "widows": true,
  "zIndex": true,
  "zoom": true
};

/**
 * Set a css value
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} val
 * @param {Mixed} extra
 */

function style(el, prop, val, extra) {
  // Don't set styles on text and comment nodes
  if (!el || el.nodeType === 3 || el.nodeType === 8 || !el.style ) return;

  var orig = camelcase(prop);
  var style = el.style;
  var type = typeof val;

  if (!val) return get(el, prop, orig, extra);

  prop = property(prop, style);

  var hook = hooks[prop] || hooks[orig];

  // If a number was passed in, add 'px' to the (except for certain CSS properties)
  if ('number' == type && !cssNumber[orig]) {
    debug('adding "px" to end of number');
    val += 'px';
  }

  // Fixes jQuery #8908, it can be done more correctly by specifying setters in cssHooks,
  // but it would mean to define eight (for every problematic property) identical functions
  if (!support.clearCloneStyle && '' === val && 0 === prop.indexOf('background')) {
    debug('set property (%s) value to "inherit"', prop);
    style[prop] = 'inherit';
  }

  // If a hook was provided, use that value, otherwise just set the specified value
  if (!hook || !hook.set || undefined !== (val = hook.set(el, val, extra))) {
    // Support: Chrome, Safari
    // Setting style to blank string required to delete "style: x !important;"
    debug('set hook defined. setting property (%s) to %s', prop, val);
    style[prop] = '';
    style[prop] = val;
  }

}

/**
 * Get the style
 *
 * @param {Element} el
 * @param {String} prop
 * @param {String} orig
 * @param {Mixed} extra
 * @return {String}
 */

function get(el, prop, orig, extra) {
  var style = el.style;
  var hook = hooks[prop] || hooks[orig];
  var ret;

  if (hook && hook.get && undefined !== (ret = hook.get(el, false, extra))) {
    debug('get hook defined, returning: %s', ret);
    return ret;
  }

  ret = style[prop];
  debug('getting %s', ret);
  return ret;
}
