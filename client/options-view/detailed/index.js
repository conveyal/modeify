/**
 * Dependencies
 */

var convert = require('convert');
var domify = require('domify');
var d3 = require('d3');
var reactive = require('reactive');
var session = require('session');
var svg = require('svg-icons');
var view = require('view');

/**
 * Significant Ratio
 */

var SRATIO = 1 / 10;

/**
 * Create black to red color conversion
 */

var diffcolor = d3.scale.linear()
  .domain([0, 60])
  .range(['#333333', '#d9534f']);

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view,
  model) {

  // get max
  var max = maxTripLength();
  var width = function(t) {
    return t / max * 100 + '%';
  };

  var segments = significantSegments(model);

  d3.select(view.el)
    .select('.summary-segments')
    .selectAll('.segment')
    .data(segments)
    .enter()
    .append('div')
    .attr('class', function(d) {
      var name = 'segment';
      if (d.type === 'bus' || d.type === 'train') name += ' white';
      return name;
    })
    .style('width', function() {
      return 1 / segments.length * 100 + '%';
    })
    .style('color', function(d) {
      return d.color;
    })
    .style('background-color', function(d) {
      if (d.type === 'train') {
        return convert.toBSColor(d.bg);
      } else if (d.type === 'bus') {
        return 'gray';
      }
      return d.bg;
    })
    .html(function(d) {
      var html = svg(d.type);
      if (d.type === 'bus') html += '<span class="name">' + d.text.toUpperCase() +
        '</span>';
      html += '<div class="clearfix"></div>';
      return html;
    });

  d3.select(view.el)
    .on('mouseover', function() {
      window.transitive.focusJourney(model.id);
    })
    .on('mouseout', function() {
      window.transitive.focusJourney();
    });
});

/**
 * Show / Hide Details
 */

View.prototype.showHideDetails = function() {
  var $details = this.find('.details');
  if ($details.classList.contains('hidden')) $details.classList.remove('hidden');
  else $details.classList.add('hidden');
};

/**
 * Average Time
 */

View.prototype.average = function() {
  return Math.round(this.model.stats.avg / 60);
};

/**
 * Total Walk Distance
 */

View.prototype.totalWalkDistance = function() {
  if (this.model.summary === 'Car' || this.model.summary === 'Bicycle') {
    return false;
  }

  return convert.metersToMiles(this.model.segments.reduce(function(memo,
    segment) {
    return memo + segment.walkTime;
  }, this.model.finalWalkTime) * 1.4);
};

/**
 * Detail template
 */

var template = require('./detail.html');
var detail = function(obj) {
  return reactive(domify(template), obj).el;
};

/**
 * Details
 */

View.prototype.details = function() {
  var segments = this.model.segments;
  var from = session.plan().from().split(',')[0];
  var to = session.plan().to().split(',')[0];
  var details = document.createDocumentFragment();

  // Add a detail
  function addDetail(d) {
    details.appendChild(detail(d));
  }

  // Starting Address
  addDetail({
    description: from,
    icon: '<i class="icon from fa fa-fw fa-dot-circle-o"></i>',
    type: 'address'
  });

  // Add transit segments
  var length = segments.length;
  for (var i = 0; i < length; i++) {
    var segment = segments[i];

    // Check for a walking distance
    if (segment.walkTime === 0) {
      // Add transfer
      addDetail({
        description: 'Transfer at station',
        icon: '',
        time: Math.round(segment.waitStats.avg / 60),
      });
    } else {
      addDetail({
        description: 'Walk to ' + segment.fromName,
        icon: svg('pedestrian'),
        time: Math.round(segment.walkTime / 60),
        type: 'pedestrian'
      });
    }

    var color = segment.type === 'train' ? convert.toBSColor(segment.routeShortName) :
      'gray';

    var description = '<p>' + segment.fromName + '</p>' + '<p>&nbsp;</p>' + '<p>' + segment.toName + '</p>';

    addDetail({
      description: description,
      icon: svg(segment.type),
      name: segment.routeShortName.toUpperCase(),
      style: 'color: #fff;fill: #fff; background-color: ' + color + ';',
      time: Math.round(segment.rideStats.avg / 60),
      type: segment.type
    });
  }

  if (segments.length === 0) {
    // One mode the entire way
    switch (this.model.summary) {
      case 'Bicycle':
        addDetail({
          description: 'Bike the entire way.',
          icon: svg('bike'),
          time: Math.round(this.model.finalWalkTime / 60),
          type: 'bicycle'
        });
        break;
      case 'Car':
        addDetail({
          description: 'Drive the entire way.',
          icon: svg('car'),
          time: Math.round(this.model.finalWalkTime / 60),
          type: 'car'
        });
        break;
      case 'Walk':
        addDetail({
          description: 'Walk the entire way.',
          icon: svg('pedestrian'),
          time: Math.round(this.model.finalWalkTime / 60),
          type: 'pedestrian'
        });
        break;
    }
  } else {
    // Final Walk Segment
    addDetail({
      description: 'Walk from ' + segments[length - 1].toName +
        ' to destination',
      icon: svg('pedestrian'),
      time: Math.round(this.model.finalWalkTime / 60),
      type: 'pedestrian'
    });
  }

  // Ending Address
  addDetail({
    description: to,
    icon: '<i class="icon to fa fa-fw fa-map-marker"></i>',
    type: 'address'
  });

  // Add to a tbody for `data-replace`
  var tbody = document.createElement('tbody');
  tbody.appendChild(details);

  return tbody;
};

/**
 * Total Calories / cost
 */

View.prototype.totalCaloriesCost = function() {
  return '$2.10';
};

/**
 * Random number of stops
 */

function randStops() {
  return parseInt(Math.random() * 10) + 2;
}

/**
 * Get significant segments
 */

function significantSegments(route) {
  var total = route.stats.avg;
  var significant = [];

  route.segments.forEach(function(segment) {
    // Add the dominant transit segment
    significant.push({
      type: segment.type,
      text: segment.routeShortName,
      bg: segment.routeShortName,
      color: '#fff',
      time: segment.waitStats.avg + segment.rideStats.avg
    });
  });

  // Add the final walking segment if it's significant
  if (route.segments.length === 0) {
    if (route.summary === 'Bicycle') {
      significant.push(singleSegment('bike', route.stats.avg));
    } else if (route.summary === 'Car') {
      significant.push(singleSegment('car', route.stats.avg));
    } else {
      significant.push(singleSegment('pedestrian', route.finalWalkTime));
    }
  }

  return significant;
}

/**
 * Create Walk Segment
 */

function singleSegment(type, time) {
  return {
    type: type,
    text: '&nbsp;',
    bg: '#fff',
    color: '#333',
    time: time
  };
}

/**
 * Get the max trip length
 */

function maxTripLength() {
  var profile = session.plan().routes();
  return profile[profile.length - 1].stats.avg;
}
