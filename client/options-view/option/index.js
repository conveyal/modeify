var colorParser = require('color-parser');
var convert = require('convert');
var d3 = require('d3');
var domify = require('domify');
var hogan = require('hogan.js');
var luminosity = require('luminosity');
var session = require('session');
var svg = require('svg-icons');
var toSentenceCase = require('to-sentence-case');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view,
  model) {
  d3.select(view.el)
    .on('mouseover', function() {
      window.transitive.focusJourney(model.id());
    });
});

/**
 * Detail template
 */

var detail = hogan.compile(require('./detail.html'));

/**
 * Details, details
 */

View.prototype.segments = function() {
  var segments = this.model.segments();
  var details = '';

  // Add a detail
  function addDetail(d) {
    details += detail.render(d);
  }

  // Add transit segments
  var length = segments.length;
  for (var i = 0; i < length; i++) {
    var segment = segments[i];

    // Check for a walking distance
    if (segment.walkTime !== 0) {
      addDetail({
        description: 'Walk ' + Math.round(segment.walkTime / 60) + ' mins',
        type: 'walk',
        segment: true
      });

      addDetail({
        description: segment.fromName,
        type: 'transfer',
        transfer: true
      });
    }

    var color = segment.type === 'train' ? segment.routeShortName.toLowerCase() :
      'gray';

    addDetail({
      description: 'Take <strong>' + segment.routeShortName + '</strong>',
      color: color,
      time: Math.round(segment.rideStats.avg / 60),
      type: segment.type,
      segment: true
    });

    addDetail({
      description: segment.toName,
      type: 'transfer',
      transfer: true
    });
  }

  if (segments.length === 0) {
    // One mode the entire way
    switch (this.model.mode()) {
      case 'bicycle':
        details += this.narrativeDirections('bike', 'Bike');
        break;
      case 'car':
        details += this.narrativeDirections('car', 'Drive');
        break;
      case 'walk':
        details += this.narrativeDirections('walk', 'Walk');
        break;
    }
  } else {
    // Final Walk Segment
    addDetail({
      description: 'Walk ' + (this.model.finalWalkTime() / 60 | 0) +
        ' mins',
      type: 'walk',
      segment: true
    });
  }

  return details;
};

/**
 * Get a narrative description
 */

function ndescription(a, dir, dis, st) {
  return a + ' ' + dir + ' on ' + st + ' for ' + convert.metersToMiles(dis) +
    ' mile(s)';
}

/**
 * Add narrative directions
 */

View.prototype.narrativeDirections = function(type, action) {
  var steps = this.model.walkSteps();

  // Add initial narrative step
  var narrative = detail.render({
    description: ndescription(action, steps[0].absoluteDirection.toLowerCase(),
      steps[0].distance, steps[0].streetName),
    segment: true,
    type: type
  });

  var iconDirection = 'east';
  for (var i = 1; i < steps.length; i++) {
    switch (steps[i].relativeDirection) {
      case 'RIGHT':
        iconDirection = 'east';
        break;
      case 'LEFT':
        iconDirection = 'west';
        break;
      case 'CONTINUE':
        iconDirection = 'north';
        break;
      case 'SLIGHTLY_RIGHT':
        iconDirection = 'northeast';
        break;
      case 'SLIGHTLY_LEFT':
        iconDirection = 'northwest';
        break;
    }

    narrative += detail.render({
      description: toSentenceCase(steps[i].relativeDirection) + ' on ' +
        steps[i].streetName + ' for ' + convert.metersToMiles(steps[i].distance) +
        ' mile(s)',
      direction: iconDirection
    });
  }

  return narrative;
};

/**
 * Average trip length in minutes
 */

View.prototype.average = function() {
  return Math.round(this.model.time());
};

/**
 * Fare
 */

View.prototype.fare = function() {
  switch (this.model.mode()) {
    case 'bicycle':
    case 'walk':
      return (this.model.calories() * 250 / 1000).toFixed(0) + 'k cals';
    default:
      var yearlyTotal = this.model.totalCost() * 250;
      if (yearlyTotal > 1000) yearlyTotal = (yearlyTotal / 1000).toFixed(2) +
        'k';
      else yearlyTotal = yearlyTotal.toFixed(0);
      return '$' + yearlyTotal;
  }
};

/**
 * Pollution
 */

View.prototype.pollution = function() {
  return this.model.mode() === 'car' ? this.model.emissions() | 0 : false;
};

/**
 * Pollution Offset
 */

View.prototype.pollutionOffset = function() {
  return this.model.mode() === 'bicycle' || this.model.mode() === 'walk' ? -
    this.model
    .emissions() | 0 : false;
};

/**
 * Distance
 */

View.prototype.distance = function() {
  return convert.milesToString(this.model.totalDistance());
};

/**
 * To/from
 */

View.prototype.from = function() {
  return session.plan().from().split(',')[0];
};
View.prototype.to = function() {
  return session.plan().to().split(',')[0];
};

/**
 * Show/hide
 */

View.prototype.showHide = function() {
  this.el.classList.toggle('expanded');
};

/**
 * Simple Template
 */

var simpleTemplate = hogan.compile(require('./simple.html'));

/**
 * Simple Segments
 */

View.prototype.simpleSegments = function() {
  var html = '';
  var segments = this.model.segments();

  segments.forEach(function(segment) {
    var rgb = colorParser(segment.color);
    rgb = [rgb.r, rgb.g, rgb.b];

    html += simpleTemplate.render({
      color: segment.color,
      light: luminosity.light(rgb) ? 'light' : 'dark',
      mode: modeToIcon(segment.mode),
      name: segment.shield
    });
  });

  if (segments.length === 0) {
    html += simpleTemplate.render({
      color: 'transparent',
      mode: modeToIcon(this.model.mode()),
      name: ' '
    });
  }

  return html;
};

function modeToIcon(m) {
  m = m.toLowerCase();
  switch (m) {
    case 'bicycle':
      return 'bike';
    case 'pedestrian':
      return 'walk';
    case 'subway':
      return 'train';
    default:
      return m;
  }
}
