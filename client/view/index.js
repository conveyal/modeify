var reactive = require('reactive');
var view = require('view');

/**
 * Set up reactive plugins
 */

reactive.use(require('./active'));
reactive.use(require('./dropdown'));
reactive.use(require('./each'));
reactive.use(require('reactive-child'));
reactive.use(require('reactive-disabled'));

/**
 * Expose `view`
 */

module.exports = function(options, fn) {
  var View;
  if (typeof options === 'string') {
    View = view(options, fn);
  } else {
    View = view(options.template, fn);
    View.prototype.title = options.title;
    View.prototype.category = options.category;
  }

  return View;
};
