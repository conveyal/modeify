var api = require('../../lib/api')
var supertest = require('supertest')

/**
 * Expose `app`
 */

module.exports = supertest(api)

/**
 * Expose `agent`
 */

module.exports.agent = function () {
  return supertest.agent(api)
}
