/**
 * Dependencies
 */

var express = require('express');
var config = require('./config');
var read = require('fs').readFileSync;
var hogan = require('hogan.js');
var mongo = require('./mongo');

/**
 * Expose `app`
 */

var app = module.exports = express()
  .use(express.favicon())
  .use(express.compress())
  .use('/build', express.static(__dirname + '/../build'))
  .use(express.urlencoded())
  .use(express.json());

/**
 * Config
 */

if (process.env.NODE_ENV !== 'test') {
  app.use(express.logger('dev'));
  app.use(logErrors);
}

/**
 * Compile the templates
 */

var planner = compile('planner');
var manager = compile('manager');

/**
 * Mount the api
 */

app.use('/api', require('./api'));

/**
 * Manager
 */

app.all('/manager*', function(req, res) {
  res.send(200, manager);
});

/**
 * Planner
 */

app.all('*', function(req, res) {
  res.send(200, planner);
});

/**
 * Handle Errors
 */

app.use(function(err, req, res, next) {
  err = err || new Error('Server error.');
  res.send(err.status || 500, err.message || err);
});

/**
 * Compile templates
 */

function compile(name) {
  var html = read(__dirname + '/../client/' + name + '.html', {
    encoding: 'utf8'
  });
  var template = hogan.compile(html);
  return template.render(config);
}

/**
 * Log errors
 */

function logErrors(req, res, next) {
  var send = res.send;
  res.send = function(status, body) {
    if (status >= 400) {
      console.log('\x1b[33m ' + status + ' — ' + JSON.stringify(body));
    }
    send.apply(res, arguments);
  };
  next();
}
