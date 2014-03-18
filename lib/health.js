var config = require('./config');
var express = require('express');
var mongoose = require('./mongo');

/**
 * Expose `app`
 */

var app = module.exports = express();

/**
 * Main check
 */

app.all('/', function(req, res) {
  // TODO: implement checks
  res.send(200, {
    analytics: 'not implemented',
    api: true, // by virtue of this being the api
    db: mongoose.connection.readyState === 1,
    logger: 'not implemented',
    otp: 'not implemented',
    worker: 'not implemented'
  });
});
