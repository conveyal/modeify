var analytics = require('analytics');
var convert = require('convert');
var Feedback = require('feedback-modal');
var mouseenter = require('mouseenter');
var mouseleave = require('mouseleave');
var RouteDirections = require('route-directions-table');
var RouteModal = require('route-modal');
var routeSummarySegments = require('route-summary-segments');
var routeResource = require('route-resource');
var session = require('session');
var transitive = require('transitive');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view, model) {
  mouseenter(view.el, function() {
    var id = model.id() + '';
    if (id.indexOf('transit') === -1) id = id + '_' + model.access()[0].mode.toLowerCase();
    transitive.focusJourney(id);
  });

  mouseleave(view.el, function() {
    if (!view.el.classList.contains('expanded')) {
      transitive.focusJourney();
    }
  });

  [].slice.call(view.findAll('input')).forEach(setInputSize);
});

View.prototype.directions = function() {
  return new RouteDirections(this.model);
};

View.prototype.segments = function() {
  return routeSummarySegments(this.model);
};

View.prototype.costSavings = function() {
  return convert.roundNumberToString(this.model.costSavings());
};

View.prototype.timeSavingsAndNoCostSavings = function() {
  return this.model.timeSavings() && !this.model.costSavings();
};

/**
 * Show/hide
 */

View.prototype.showDetails = function(e) {
  e.preventDefault();
  var el = this.el;
  var expanded = document.querySelector('.option.expanded');
  if (expanded) expanded.classList.remove('expanded');

  el.classList.add('expanded');

  analytics.track('Expanded Route Details', {
    plan: session.plan().generateQuery(),
    route: {
      modes: this.model.modes(),
      summary: this.model.summary()
    }
  });

  var scrollable = document.querySelector('.scrollable');
  scrollable.scrollTop = el.offsetTop - 52;
};

View.prototype.hideDetails = function(e) {
  e.preventDefault();
  var list = this.el.classList;
  if (list.contains('expanded')) {
    list.remove('expanded');
  }
};

/**
 * Input change
 */

View.prototype.inputChange = function(e) {
  e.preventDefault();
  var input = e.target;
  var name = input.name;
  var value = parseFloat(input.value);

  if (!isNaN(value)) {
    var plan = session.plan();
    var scorer = plan.scorer();

    switch (name) {
      case 'bikeSpeed':
        scorer.rates.bikeSpeed = convert.mphToMps(value);
        break;
      case 'tripsPerYear':
        plan.tripsPerYear(value);
        break;
      case 'carParkingCost':
        scorer.rates.carParkingCost = value;
        break;
      case 'transitCost':
        this.model.transitCost(value);
        break;
      case 'vmtRate':
        scorer.rates.mileageRate = value;
        break;
      case 'walkSpeed':
        scorer.rates.walkSpeed = convert.mphToMps(value);
        break;
    }

    plan.rescoreOptions();
  }

  setInputSize(input);
};

/**
 * Set input size
 */

function setInputSize(i) {
  var size = i.value.length || 1;
  i.setAttribute('size', size);
}

/**
 * Get the option number for display purposes (1-based)
 */

View.prototype.optionNumber = function() {
  return this.model.index + 1;
};

/**
 * View
 */

View.prototype.feedback = function(e) {
  e.preventDefault();
  Feedback(this.model).show();
};

/**
 * Select this option
 */

View.prototype.selectOption = function() {
  var route = this.model;
  var plan = session.plan();
  var tags = route.tags(plan);

  routeResource.findByTags(tags, function(err, resources) {
    var routeModal = new RouteModal(route, null, {
      context: 'route-card',
      resources: resources
    });
    routeModal.show();
    routeModal.on('next', function() {
      routeModal.hide();
    });
  });
};
