/**
 * Dependencies
 */

var auth = require('../auth');
var config = require('../config');
var express = require('express');
var superagent = require('superagent');

/**
 * Expose `app`
 */

var app = module.exports = express();

/**
 * Proxy
 */

app.all('*', function(req, res) {
  superagent
    .get(config.otp_url + req.url)
    .end(function(err, data) {
      if (err || !data.ok) {
        res.send(400, err || data.text);
      } else {
        res.send(200, data.body);
      }
    });
});
