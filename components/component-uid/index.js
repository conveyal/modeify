/**
 * Base 64 characters
 */

var BASE64 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

/**
 * Make a Uint8Array into a string
 *
 * @param {Uint8Array}
 * @returns {String}
 * @api private
 */

function tostr(bytes) {
  var r, i;

  r = [];
  for (i = 0; i < bytes.length; i++) {
    r.push(BASE64[bytes[i] % 64]);
  }

  return r.join('');
}

/**
 * Generate an unique id
 *
 * @param {Number} The number of chars of the uid
 * @api public
 */

function uid(length) {
  if (typeof window != 'undefined') {
    if (typeof window.crypto != 'undefined') {
      return tostr(window.crypto.getRandomValues(new Uint8Array(length)));
    } else {
      var a = new Array(length);
      for (var i = 0; i < length; i++) {
        a[i] = Math.floor(Math.random() * 256);
      }
      return tostr(a);
    }
  } else {
    var crypto = require('cryp'+'to'); // avoid browserify polyfill
    try {
      return tostr(crypto.randomBytes(length));
    } catch (e) {
      // entropy sources are drained
      return tostr(crypto.pseudoRandomBytes(length));
    }
  }
}

/**
 * Exports
 */

module.exports = uid;
