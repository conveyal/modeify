/**
 * Dependencies
 */

var debug = require('debug')('dashboard-page');
var template = require('./template.html');
var create = require('view');

/**
 * Create view
 */

var View = create(template);

/**
 * Expose `render`
 */

module.exports = function(ctx) {
  debug('view');

  ctx.view = new View();
};
