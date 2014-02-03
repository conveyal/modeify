/**
 * Dependencies
 */

var debug = require('debug')('request');
var spin = require('spinner');
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

  var spinner = spin();
  superagent
    .get(base + url)
    .query(params)
    .end(function(err, res) {
      debug('%s GET %s%s?%s', res.status, base, url, JSON.stringify(params));
      callback(err, res);
      spinner.remove();
    });
};

/**
 * Expose `post`
 */

module.exports.post = function(url, data, callback) {
  var spinner = spin();
  superagent
    .post(base + url)
    .send(data)
    .end(function(err, res) {
      debug('%s POST %s%s > %s', res.status, base, url, JSON.stringify(data));
      callback(err, res);
      spinner.remove();
    });
};

/**
 * Expose `del`
 */

module.exports.del = function(url, callback) {
  var spinner = spin();
  superagent
    .del(base + url)
    .end(function(err, res) {
      debug('%s DELETE %s%s', res.status, base, url);
      callback(err, res);
      spinner.remove();
    });
};
