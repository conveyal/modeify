var config = require('./config');
var express = require('express');
var mongoose = require('./mongo');

/**
 * Expose `router`
 */

var router = module.exports = express.Router();

/**
 * Main check
 */

router.all('/', function(req, res) {
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
