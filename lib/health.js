var config = require('./config');
var express = require('express');
var mongoose = require('./mongo');
var otp = require('./otp');

/**
 * Expose `router`
 */

var router = module.exports = express.Router();

/**
 * Main check
 */

router.all('/', checkOTP, function(req, res) {
  // TODO: implement checks
  res.send(200, {
    analytics: 'not implemented',
    api: true, // by virtue of this being the api
    db: mongoose.connection.readyState === 1,
    logger: 'not implemented',
    otp: !req.otp,
    worker: 'not implemented'
  });
});

/**
 * OTP
 */

router.all('/otp', checkOTP, function(req, res) {
  if (!req.otp) {
    res.send(204);
  } else {
    res.send(400, req.otp);
  }
});

/**
 * Check OTP
 */

function checkOTP(req, res, next) {
  otp.get({
    url: '/index/routes'
  }, function(err, routes) {
    req.otp = err;
    next();
  });
}
