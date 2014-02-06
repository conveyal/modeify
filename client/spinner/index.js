/**
 * Dependencies
 */

var domify = require('domify');
var spin = require('spin');
var template = require('./template.html');

/**
 * Append template to the page
 */

document.body.appendChild(domify(template));

/**
 * Store one spinner at a time
 */

var spinner = null;

/**
 * Store the spinner div
 */

var el = document.getElementById('spinner');

/**
 * Expose `spinner`
 */

module.exports = function() {
  el.style.display = 'block';

  if (spinner) return spinner;
  spinner = spin(el, {
    size: el.offsetWidth / 15
  });

  window.onresize = function() {
    if (spinner) spinner.update();
  };

  var remove = spinner.remove;
  spinner.remove = function() {
    if (spinner) remove.apply(spinner, arguments);
    el.style.display = 'none';
    spinner = null;
  };

  return spinner;
};
