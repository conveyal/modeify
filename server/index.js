/**
 * Env
 */

var env = process.env.NODE_ENV || 'development';

/**
 * Dependencies
 */

var express = require('express');
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
});

/**
 * Compile the templates
 */

var planner = compile('planner', {
  css: '/build/planner-app/build.css',
  js: '/build/planner-app/build.js'
});
var manager = compile('manager', {
  css: '/build/manager-app/build.css',
  js: '/build/manager-app/build.js'
});

/**
 * Mount the api
 */

app.use('/api', require('./api'));

/**
 * Planner
 */

app.all('/planner*', function(req, res) {
  res.send(200, planner);
});

/**
 * Manager
 */

app.all('*', function(req, res) {
  res.send(200, manager);
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
