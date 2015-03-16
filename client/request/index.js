var config = require('config');
var debug = require('debug')(config.name() + ':request');
var nocache = require('superagent-no-cache');
var prefix = require('superagent-prefix')(config.api_url());
var superagent = require('superagent');

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
  return superagent
    .get(url)
    .use(prefix)
    .use(nocache)
    .query(params)
    .end(response(name, callback));
};

/**
 * Expose `post`
 */

module.exports.post = function(url, data, callback) {
  var name = 'POST ' + url;
  debug('--> %s', name);
  return superagent
    .post(url)
    .use(prefix)
    .use(nocache)
    .send(data)
    .end(response(name, callback));
};

/**
 * Expose `del`
 */

module.exports.del = function(url, callback) {
  var name = 'DELETE ' + url;
  debug('--> %s', name);
  return superagent
    .del(url)
    .use(prefix)
    .use(nocache)
    .end(response(name, callback));
};

/**
 * Response
 */

function response(name, callback) {
  var called = false;
  callback = callback || function() {};
  return function(err, res) {
    if (!called) {
      called = true;
      debug('<-- %s > %s', name, err || res.error || res.status);
      callback(err || res.error, res);
    } else {
      debug('<-- %s called more than once > %s', name, err || res.error || res.status);
    }
  };
}
