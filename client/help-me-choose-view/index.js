var d3 = require('d3');
var hogan = require('hogan.js');
var modal = require('modal');
var RouteModal = require('route-modal');
var routeResource = require('route-resource');
var routeSummarySegments = require('route-summary-segments');
var session = require('session');
var tableize = require('tableize');
var toCapitalCase = require('to-capital-case');

var optionTemplate = hogan.compile(require('./option.html'));
var routeTemplate = hogan.compile(require('./route.html'));

var filters = {
  calories: function(a) {
    return -a.calories;
  },
  cost: function(a) {
    return a.cost;
  },
  time: function(a) {
    return a.time;
  },
  none: function(a) {
    return 0;
  },
  productiveTime: function(a) {
    return -a.productiveTime;
  },
  walkDistance: function(a) {
    return a.walkDistance;
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

  view.firstFilter.value = 'cost';
  view.secondFilter.value = 'walkDistance';

  view.oneWay = true;
  view.daily = true;

  view.refresh();
});

/**
 * Refresh
 */

Modal.prototype.refresh = function(e) {
  if (e) e.preventDefault();

  var i;
  var thead = this.find('thead');
  var tbody = this.find('tbody');

  // Remove rows
  tbody.innerHTML = '';

  // Remove all colors
  var headers = thead.querySelectorAll('th');
  for (i = 0; i < headers.length; i++) {
    headers[i].classList.remove('primaryFilter');
    headers[i].classList.remove('secondaryFilter');
  }
  var phead = thead.querySelector('.' + this.firstFilter.value);
  if (phead) phead.classList.add('primaryFilter');
  var shead = thead.querySelector('.' + this.secondFilter.value);
  if (shead) shead.classList.add('secondaryFilter');

  // Get the indexes
  var primary = filters[this.firstFilter.value];
  var secondary = filters[this.secondFilter.value];

  // Get the multiplier
  var multiplier = this.oneWay ? 1 : 2;
  multiplier *= this.daily ? 1 : 365;

  // Get the route data
  var routes = this.model.map(function(r, index) {
    return getRouteData(r, multiplier, index);
  });

  // Sort by secondary first
  routes = rankRoutes(routes, primary, secondary);

  // Render
  for (i = 0; i < routes.length; i++) {
    var route = routes[i];
    tbody.innerHTML += this.renderRoute(route);
    var row = tbody.childNodes[i];
    var pcell = row.querySelector('.' + this.firstFilter.value);
    var scell = row.querySelector('.' + this.secondFilter.value);

    if (pcell) pcell.style.backgroundColor = toRGBA(route.primaryColor, 0.25);
    if (scell) scell.style.backgroundColor = toRGBA(route.secondaryColor, 0.25);
  }
};

/**
 * Append option
 */

Modal.prototype.renderRoute = function(data) {
  data.calories = data.calories ? parseInt(data.calories).toLocaleString() + ' cals' : 'None';
  data.cost = data.cost ? '$' + data.cost.toFixed(2) : 'Free';
  data.emissions = data.emissions ? parseInt(data.emissions) : 'None';
  data.productiveTime = data.productiveTime ? parseInt(data.productiveTime).toLocaleString() + ' min' : 'None';
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
 * Select this option
 */

Modal.prototype.selectRoute = function(e) {
  e.preventDefault();
  if (e.target.tagName !== 'BUTTON') return;

  var index = e.target.dataset.index;
  var route = this.model[index];
  var plan = session.plan();
  var tags = route.tags(plan);
  var self = this;

  window.analytics.track('Route Selected', tableize({
    plan: plan.generateQuery(),
    route: {
      modes: route.modes(),
      summary: route.summary()
    }
  }));

  routeResource.findByTags(tags, function(err, resources) {
    var routeModal = new RouteModal(route, null, {
      context: 'option',
      resources: resources
    });
    self.hide();
    routeModal.show();
    routeModal.on('next', function() {
      routeModal.hide();
    });
  });
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
  var buttons = parent.getElementsByTagName('button');

  for (var i = 0; i < buttons.length; i++)
    buttons[i].classList.remove('active');

  button.classList.add('active');

  this.refresh();
};

/**
 * Rank & sort the routes
 */

function rankRoutes(routes, first, second) {
  var primaryDomain = [d3.min(routes, first), d3.max(routes, first)];
  var secondaryDomain = [d3.min(routes, second), d3.max(routes, second)];

  var primaryScale = d3.scale.linear()
    .domain(primaryDomain)
    .range([0, routes.length * 2]);

  var secondaryScale = d3.scale.linear()
    .domain(secondaryDomain)
    .range([1, routes.length]);

  var primaryColor = d3.scale.linear()
    .domain(primaryDomain)
    .range(['#f5a81c', '#fff']);

  var secondaryColor = d3.scale.linear()
    .domain(secondaryDomain)
    .range(['#8ec449', '#fff']);

  routes = routes.map(function(r) {
    r.primaryRank = primaryScale(first(r));
    r.primaryColor = primaryColor(first(r));
    r.secondaryRank = secondaryScale(second(r));
    r.secondaryColor = secondaryColor(second(r));
    r.rank = r.primaryRank + r.secondaryRank;
    return r;
  });

  routes.sort(function(a, b) {
    return a.rank - b.rank;
  }); // lowest number first

  return routes;
}

/**
 * RGB to transparent
 */

function toRGBA(rgb, opacity) {
  var c = d3.rgb(rgb);
  return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + opacity + ')';
}

/**
 * Get route data
 */

function getRouteData(route, multiplier, index) {
  var data = {
    segments: routeSummarySegments(route, {
      inline: true
    }),
    index: index,
    time: route.average(),
    frequency: 0,
    cost: route.cost(),
    walkDistance: route.walkDistances(),
    calories: route.totalCalories(),
    productiveTime: route.timeInTransit(),
    emissions: route.emissions(),
    score: route.score(),
    rank: 0
  };

  if (multiplier > 1) {
    ['cost', 'calories', 'productiveTime', 'emissions'].forEach(function(type) {
      data[type] = data[type] * multiplier;
    });
  }

  return data;
}
