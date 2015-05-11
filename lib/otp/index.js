var config = require('../config').otp
var superagent = require('superagent')

/**
 * Expose `get`
 */

module.exports.get = function (opts, callback) {
  superagent
    .get(config.host + ':' + config.port + config.path + opts.url)
    .set(opts.headers || {})
    .end(function (err, res) {
      if (err || res.error || !res.ok) {
        callback(err || res.error || res.text)
      } else {
        callback(null, res.body)
      }
    })
}
