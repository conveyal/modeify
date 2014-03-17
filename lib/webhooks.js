var config = require('./config');
var Email = require('./email/model');
var express = require('express');
var log = require('./log');

/**
 * Expose `app`
 */

var app = module.exports = express();

/**
 * Mandrill
 */

app.post('/mandrill', function(req, res) {
  log.info('mandrill webhook event', req.body);
  res.send(200);
});
