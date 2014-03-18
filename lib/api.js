var auth = require('./auth');
var config = require('./config');
var express = require('express');
var log = require('./log');
var read = require('fs').readFileSync;
var hogan = require('hogan.js');

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

app.use('/api', auth);
app.use('/api/campaigns', require('./campaign'));
app.use('/api/commuters', require('./commuter'));
app.use('/api/events', require('./event'));
app.use('/api/emails', require('./email'));
app.use('/api/health', require('./health'));
app.use('/api/geocode', require('./geocode'));
app.use('/api/organizations', require('./organization'));
app.use('/api/otp', require('./otp'));
app.use('/api/users', require('./user'));
app.use('/api/webhooks', require('./webhooks'));

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
      log.error(status, body);
    }
    send.apply(res, arguments);
  };
  next();
}
