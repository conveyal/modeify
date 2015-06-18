
/**
 * Dependencies
 */

var fore = require('./fore')
  , sur = require('./sur')
  , flength = fore.length
  , slength = sur.length;

/**
 * Expose `randomName`
 */

module.exports = randomName;

/**
 * Expose `forenames` and `surnames`
 */

module.exports.fore = fore;
module.exports.sur = sur;

/**
 * Get's a random name
 *
 * @return {String} name
 * @api public
 */

function randomName() {
  return fore[Math.floor(Math.random() * flength)] + ' ' + sur[Math.floor(Math.random() * slength)];
}
