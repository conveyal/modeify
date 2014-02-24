/**
 * Env
 */

var env = process.env.NODE_ENV || 'development';

/**
 * Dependencies
 */

var express = require('express');
var config = require('../config.json')[env];
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

app.configure('development', function() {
  app.use(express.logger('dev'));
  app.use(logErrors);
});

/**
 * Compile the templates
 */

var planner = compile('planner', {
  css: config.static_url + '/build/planner-app/build.css',
  js: config.static_url + '/build/planner-app/build.js'
});
var manager = compile('manager', {
  css: config.static_url + '/build/manager-app/build.css',
  js: config.static_url + '/build/manager-app/build.js'
});

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

function compile(name, opts) {
  var html = read(__dirname + '/../client/' + name + '.html', {
    encoding: 'utf8'
  });
  var template = hogan.compile(html);

  for (var key in process.env) {
    opts[key] = process.env[key];
  }

  return template.render(opts);
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
