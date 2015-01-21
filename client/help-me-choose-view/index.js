var hogan = require('hogan.js');
var modal = require('modal');
var routeSummarySegments = require('route-summary-segments');
var toCapitalCase = require('to-capital-case');

var optionTemplate = hogan.compile(require('./option.html'));
var routeTemplate = hogan.compile(require('./route.html'));

var filters = {
  caloriesBurned: function(a, b) {
    return b.calories - a.calories;
  },
  cost: function(a, b) {
    return a.cost - b.cost;
  },
  fastestTime: function(a, b) {
    return a.time - b.time;
  },
  // highestFrequency: function(a, b) {},
  none: function(a, b) { return 0; },
  productiveTime: function(a, b) {
    return b.productiveTime - a.productiveTime;
  },
  score: function(a, b) {
    return a.score - b.score;
  },
  walkDistance: function(a, b) {
    return a.walkDistance - b.walkDistance;
  },
};

/**
 * Expose `Modal`
 */

var Modal = module.exports = modal({
  closable: true,
  width: '768px',
  template: require('./template.html')
}, function(view, routes) {

  view.firstFilter = view.find('#first-filter');
  view.secondFilter = view.find('#second-filter');

  view.firstFilter.value = 'score';
  view.secondFilter.value = 'none';

  view.oneWay = true;
  view.daily = true;

  view.refresh();
});

/**
 * Refresh
 */

Modal.prototype.refresh = function(e) {
  e && e.preventDefault();

  // Routes
  var routes = this.model;

  // Remove existing rows
  var tbody = this.find('tbody');
  tbody.innerHTML = '';

  // Get the indexes
  var primary = filters[this.firstFilter.value];
  var secondary = filters[this.secondFilter.value];

  // Get the multiplier
  var multiplier = this.oneWay ? 1 : 2;
  multiplier *= this.daily ? 1 : 365;

  // Get the route data
  var routes = this.model.map(function(r) {
    return getRouteData(r, multiplier);
  });

  // Sort by secondary first
  routes.sort(secondary);
  routes.sort(primary);

  // Render
  for (var i = 0; i < routes.length; i++) {
    tbody.innerHTML += this.renderRoute(routes[i]);
  }
};

/**
 * Get route data
 */

function getRouteData(route, multiplier) {
  var data = {
    segments: routeSummarySegments(route, {
      inline: true
    }),
    time: route.average(),
    frequency: 0,
    cost: route.cost(),
    walkDistance: route.walkDistances(),
    calories: route.totalCalories(),
    productiveTime: route.timeInTransit(),
    emissions: route.emissions(),
    score: route.score()
  };

  if (multiplier > 1) {
    [ 'cost', 'calories', 'productiveTime', 'emissions' ].forEach(function(type) {
      data[type] = data[type] * multiplier;
    });
  }

  return data;
}

/**
 * Append option
 */

Modal.prototype.renderRoute = function(data) {
  data.calories = data.calories ? parseInt(data.calories) + ' cals' : 'None';
  data.cost = data.cost ? '$' + data.cost.toFixed(2) : 'Free';
  data.emissions = data.emissions ? parseInt(data.emissions) : 'None';
  data.productiveTime = data.productiveTime ? parseInt(data.productiveTime) + ' min' : 'None';
  data.walkDistance = data.walkDistance ? data.walkDistance + ' mi' : 'None';

  return routeTemplate.render(data);
};

/**
 * Filters
 */

Modal.prototype.filters = function() {
  var options = '';
  for (var f in filters) {
    options += optionTemplate.render({
      name: toCapitalCase(f).toLowerCase(),
      value: f
    });
  }
  return options;
};

/**
 * Multipliers
 */

Modal.prototype.setOneWay = function(e) {
  this.oneWay = true;
  this.setMultiplier(e);
};

Modal.prototype.setRoundTrip = function(e) {
  this.oneWay = false;
  this.setMultiplier(e);
};

Modal.prototype.setDaily = function(e) {
  this.daily = true;
  this.setMultiplier(e);
};

Modal.prototype.setYearly = function(e) {
  this.daily = false;
  this.setMultiplier(e);
};

Modal.prototype.setMultiplier = function(e) {
  e.preventDefault();

  var button = e.target;
  var parent = button.parentNode;
  var buttons = parent.getElementsByTagName('button')

  for (var i = 0; i < buttons.length; i++)
    buttons[i].classList.remove('active');

  button.classList.add('active');

  this.refresh();
};
