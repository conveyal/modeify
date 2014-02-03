/**
 * Dependencies
 */

var template = require('./template.html');
var create = require('view');

/**
 * Store `alerts`
 */

var $alerts = document.getElementById('alerts');

/**
 * Expose `Alert`
 */

var Alert = module.exports = create(template, function(alert) {
  $alerts.appendChild(alert.el);
});

/**
 * Dispose
 */

Alert.prototype.dispose = function(e) {
  e.preventDefault();
  this.off();
  this.el.remove();
};
