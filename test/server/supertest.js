/**
 * Dependencies
 */

var app = require('../../server');
var supertest = require('supertest');

/**
 * Expose `app`
 */

module.exports = supertest(app);

/**
 * Expose `agent`
 */

module.exports.agent = function() {
  return supertest.agent(app);
};
