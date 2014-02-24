/**
 * Dependencies
 */

var series = require('array-series');
var config = require('config');
var debug = require('debug')(config.name() + ':otp');
var geocode = require('geocode');
var jsonp = require('jsonp');
var qs = require('querystring');

/**
 * Expose `profile`
 */

module.exports.profile = function(from, to, callback) {
  series([
    function(done) {
      geocode(from, function(err, ll) {
        if (err) {
          done(err);
        } else {
          from = [ ll.lat, ll.lng ];
          done();
        }
      });
    },
    function(done) {
      geocode(to, function(err, ll) {
        if (err) {
          done(err);
        } else {
          to = [ ll.lat, ll.lng ];
          done();
        }
      });
    }
  ], function(err) {
    if (err) {
      callback(err);
    } else {
      jsonp(config.otp_url() + '/profile?' + qs.stringify({
        from: from,
        to: to
      }), callback);
    }
  });
};
