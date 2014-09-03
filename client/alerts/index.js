var Alert = require('alert');
var config = require('config');
var debug = require('debug')(config.name() + ':alerts');
var domify = require('domify');
var each = require('each');

/**
 * Alerts
 */

var alerts = [];
var el = document.getElementById('alerts');

/**
 * Append el
 */

document.body.insertBefore(domify(require('./template.html')), document.body.firstChild);

/**
 * Expose `render` middleware
 */

module.exports = function(ctx, next) {
  debug('displaying');

  // remove all alerts
  el.innerHTML = '';

  // create all alerts in local storage
  each(alerts, function(info) {
    newAlert(info);
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
        newAlert({
          type: name,
          text: val
        });
        break;
    }
  });

  next();
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
  return newAlert(info);
};

/**
 * Alert!
 */

function newAlert(o) {
  var al = new Alert(o);
  el.appendChild(al.el);
  return al;
}
