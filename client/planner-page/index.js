/**
 * Dependencies
 */

var FilterView = require('filter-view');
var OptionsView = require('options-view');
var Plan = require('plan');
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
  var plan = new Plan();

  ctx.view = new View({
    filter: new FilterView(plan),
    'options-view': new OptionsView(plan),
    transitive: new TransitiveView(plan)
  });

  document.getElementById('main').appendChild(ctx.view.el);

  ctx.view.emit('rendered');
  ctx.view.model.filter.emit('rendered');
  ctx.view.model['options-view'].emit('rendered');
  ctx.view.model.transitive.emit('rendered');
};
