
/**
 * Dependencies
 */

var debug = require('debug')('request');
var superagent = require('superagent');

/**
 * Base URL
 */

var base = '/api';

/**
 * Expose `get`
 */

module.exports.get = function(url, params, callback) {
  if (arguments.length === 2) {
    callback = params;
    params = {};
  }

  superagent
  .get(base + url)
  .query(params)
  .end(function(err, res) {
    debug('%s GET %s%s?%s', res.status, base, url, JSON.stringify(params));
    callback(err, res);
  });
};

/**
 * Expose `post`
 */

module.exports.post = function(url, data, callback) {
  superagent
  .post(base + url)
  .send(data)
  .end(function(err, res) {
    debug('%s POST %s%s > %s', res.status, base, url, JSON.stringify(data));
    callback(err, res);
  });
};
