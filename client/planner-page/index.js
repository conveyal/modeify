/**
 * Dependencies
 */

var each = require('each');
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
  var views = {
    'filter-view': new FilterView(ctx.plan),
    'locations-view': new LocationsView(ctx.plan),
    'options-view': new OptionsView(ctx.plan),
    'transitive-view': new TransitiveView(ctx.plan)
  };

  ctx.view = new View(views);

  ctx.view.on('rendered', function() {
    each(views, function(key, view) {
      view.emit('rendered', view);
    });

    ctx.plan.geocode('from', function(err, ll) {
      ctx.plan.geocode('to');
    });
  });

  next();
};
