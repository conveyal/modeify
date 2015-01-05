
/**
 * Expose `tableize()`.
 */

module.exports = tableize;

/**
 * Tableize `obj` by flattening and normalizing the keys.
 *
 * @param {Object} obj
 * @return {Object}
 * @api public
 */

function tableize(obj, opts) {
  var ret = {};
  opts = opts || {};
  type(ret, obj, '', opts);
  return ret;
}

/**
 * Type `obj` recursively.
 *
 * @param {Object} schema
 * @param {Object} obj
 * @param {String} prefix
 * @api private
 */

function type(schema, obj, prefix, opts) {
  Object.keys(obj).forEach(function(key){
    var val = obj[key];

    key = prefix + normalize(key);
    if (opts.lowercase) key = key.toLowerCase();

    if (isObject(val)) {
      type(schema, val, key + '.', opts);
    } else {
      schema[key] = val;
    }
  });
}

/**
 * Check if `val` is an object.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api private
 */

function isObject(val) {
  return '[object Object]' == Object.prototype.toString.call(val);
}

/**
 * Normalize `key`.
 *
 * @param {String} key
 * @return {String}
 * @api private
 */

function normalize(key) {
  return key.trim().replace(/[\s-]+/g, '_');
}
