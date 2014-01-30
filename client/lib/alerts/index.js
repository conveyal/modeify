
/**
 * Dependencies
 */

var Alert = require('alert');
var debug = require('debug')('alerts');
var each = require('each');

/**
 * Local Storage
 */

var ls = window.localStorage;

/**
 * Expose `render`
 */

module.exports = function(ctx) {
  debug('displaying');

  var el = document.getElementById('alerts');
  el.innerHTML = '';

  each(ls.getItem('alerts') || [], function(info) {
    var alert = new Alert(info);
    el.appendChild(alert);
  });

  each(ctx.query, function(name, val) {
    switch(name) {
      case 'danger':
      case 'info':
      case 'success':
      case 'warning':
        var alert = new Alert({
          type: name,
          text: val
        });
        el.appendChild(alert.el);
        break;
    }
  });
};

/**
 * Push
 */

module.exports.push = function(info) {
  var alerts = [].concat(ls.getItem('alerts') || []);
  ls.setItem('alerts', alerts.push(info));
};
