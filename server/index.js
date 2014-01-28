/**
 * Env
 */

var env = process.env.NODE_ENV || 'development';

/**
 * Dependencies
 */

var express = require('express');
var fs = require('fs');
var mongo = require('./mongo');

/**
 * Expose `app`
 */

var app = module.exports = express()
  .use(express.compress())
  .use(express.urlencoded())
  .use(express.json());

/**
 * Config
 */

app.configure('development', function() {
  app.use(express.logger('dev'));
});

/**
 * Admin
 */

app.use('/admin', require('./admin'));

/**
 * Mount the api
 */

app.use('/api', require('./api'));

/**
 * Deliver the static content
 */

app.use('/build', express.static(__dirname + '../build'));

/**
 * Get the app
 */

app.all('*', function(req, res) {
  fs.readFile(__dirname + '/../client/index.html', {
    encoding: 'utf8'
  }, function(err, data) {
    res.send(200, data);
  });
});

/**
 * Handle Errors
 */

app.use(function(err, req, res, next) {
  err = err || new Error('Server error.');
  res.send(err.status || 500, err.message || err);
});
