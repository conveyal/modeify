/**
 * Dependencies
 */

var auth = require('../auth');
var config = require('../config');
var express = require('express');
var httpProxy = require('http-proxy');

/**
 * Create routing proxy
 */

var proxy = new httpProxy.createProxyServer({
  target: config.otp_url
});

/**
 * Expose `app`
 */

var app = module.exports = express();
//.use(auth.isLoggedIn);

/**
 * Proxy
 */

app.all('*', function(req, res) {
  proxy.web(req, res);
});
