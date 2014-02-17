/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':organizations-page');
var map = require('map');
var Organization = require('organization');
var Row = require('./row');
var template = require('./template.html');
var view = require('view');

/**
 * Create `OrganizationsPage`
 */

var Page = view(template);

/**
 * Expose `render` middleware
 */

module.exports = function(ctx, next) {
  debug('render');

  Organization.all(function(err, orgs, res) {
    if (err || !res.ok) {
      window.alert(res.text || 'Failed to load organizations.');
    } else {
      ctx.view = new Page();
      var tbody = ctx.view.find('tbody');
      orgs.each(function(org) {
        var row = new Row(org);
        tbody.appendChild(row.el);
      });

      next();
    }
  });
};
