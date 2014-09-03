var config = require('config');
var debug = require('debug')(config.name() + ':request');
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

  var name = 'GET ' + url;
  debug('--> %s', name);
  superagent
    .get(base + url)
    .query(params)
    .end(response(name, callback));
};

/**
 * Expose `post`
 */

module.exports.post = function(url, data, callback) {
  var name = 'POST ' + url;
  debug('--> %s', name);
  superagent
    .post(base + url)
    .send(data)
    .end(response(name, callback));
};

/**
 * Expose `del`
 */

module.exports.del = function(url, callback) {
  var name = 'DELETE ' + url;
  debug('--> %s', name);
  superagent
    .del(base + url)
    .end(response(name, callback));
};

/**
 * Response
 */

function response(name, callback) {
  callback = callback || function() {};
  return function(err, res) {
    debug('<-- %s > %s', name, err || res.error || res.status);
    callback(err || res.error, res);
  };
}
