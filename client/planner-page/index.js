/**
 * Dependencies
 */

var FilterView = require('filter-view');
var LocationsView = require('locations-view');
var OptionsView = require('options-view');
var TransitiveView = require('transitive-view');
var view = require('view');

/**
 * Create `View`
 */

var View = view(require('./template.html'));

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  ctx.view = new View({
    filter: new FilterView(ctx.plan),
    'locations-view': new LocationsView(ctx.plan),
    'options-view': new OptionsView(ctx.plan),
    transitive: new TransitiveView(ctx.plan)
  });

  ctx.view.on('rendered', function() {
    [ 'filter', 'locations-view', 'options-view', 'transitive' ].forEach(function(view) {
      ctx.view.model[view].emit('rendered');
    });
  });

  next();
};
