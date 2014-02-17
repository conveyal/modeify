/**
 * Dependencies
 */

var Alert = require('alert');
var config = require('config');
var debug = require('debug')(config.name() + ':alerts');
var domify = require('domify');
var each = require('each');
var template = require('./template.html');

/**
 * Alerts
 */

var alerts = [];

/**
 * Append el
 */

document.body.insertBefore(domify(template), document.body.firstChild);

/**
 * Expose `render` middleware
 */

module.exports = function(ctx) {
  debug('displaying');

  // remove all alerts
  var el = document.getElementById('alerts');
  el.innerHTML = '';

  // create all alerts in local storage
  each(alerts, function(info) {
    new Alert(info);
  });

  // reset local storage
  alerts = [];

  // create all alerts in the query parameters
  each(ctx.query, function(name, val) {
    switch (name) {
      case 'danger':
      case 'info':
      case 'success':
      case 'warning':
        new Alert({
          type: name,
          text: val
        });
        break;
    }
  });
};

/**
 * Push
 */

module.exports.push = function(info) {
  alerts = [info].concat(alerts);
};

/**
 * Show
 */

module.exports.show = function(info) {
  return new Alert(info);
};
