var express = require('express');
var geocode = require('./geocode');
var mongoose = require('./mongo');
var otp = require('./otp');

/**
 * Expose `router`
 */

var router = module.exports = express.Router();

/**
 * Main check
 */

router.all('/', checkGeocoder, checkOTP, function(req, res) {
  var checks = {
    api: true,
    db: mongoose.connection.readyState === 1,
    geocoder: !req.geocoder,
    logger: 'not implemented',
    otp: !req.otp,
    worker: 'not implemented'
  };

  // TODO: implement checks
  res.status(200).send(checks);
});

/**
 * OTP
 */

router.all('/otp', checkOTP, function(req, res) {
  if (!req.otp) {
    res.status(204).end();
  } else {
    res.status(400).send(req.otp);
  }
});

/**
 * Check Geocoder
 */

function checkGeocoder(req, res, next) {
  geocode.suggest('1133 15th St NW, Washington, DC', function(err, suggestions) {
    req.geocoder = err;
    next();
  });
}

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
