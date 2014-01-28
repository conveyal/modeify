/**
 * Dependencies
 */

var supertest = require('supertest');

/**
 * Expose `app`
 */

module.exports = supertest(require('../../server'));
