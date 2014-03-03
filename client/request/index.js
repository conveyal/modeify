/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':request');
var spin = require('spinner');
var superagent = require('superagent');

/**
 * Base URL
 */

var base = config.api_url();

/**
 * Expose `get`
 */

module.exports.get = function(url, params, callback) {
  if (arguments.length === 2) {
    callback = params;
    params = null;
  }

  debug('--> GET %s', url);
  var spinner = spin();
  superagent
    .get(base + url)
    .query(params)
    .end(function(err, res) {
      debug('<-- GET %s > %s', url, res.status);
      callback(err, res);
      spinner.remove();
    });
};

/**
 * Expose `post`
 */

module.exports.post = function(url, data, callback) {
  debug('--> POST %s', url);
  var spinner = spin();
  superagent
    .post(base + url)
    .send(data)
    .end(function(err, res) {
      debug('<-- POST %s > %s', url, res.status);
      callback(err, res);
      spinner.remove();
    });
};

/**
 * Expose `del`
 */

module.exports.del = function(url, callback) {
  debug('--> DELETE %s', url);
  var spinner = spin();
  superagent
    .del(base + url)
    .end(function(err, res) {
      debug('<-- DELETE %s > %s', url, res.status);
      callback(err, res);
      spinner.remove();
    });
};
