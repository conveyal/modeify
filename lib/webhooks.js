var config = require('./config');
var Email = require('./email/model');
var express = require('express');

/**
 * Expose `app`
 */

var app = module.exports = express();

/**
 * Mandrill
 */

app.post('/mandrill', function(req, res) {
  res.send(200);
});
