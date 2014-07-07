var convert = require('convert');
var d3 = require('d3');
var domify = require('domify');
var hogan = require('hogan.js');
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
      if (model.mode === 'bus' || model.mode === 'subway' || model.mode ===
        'train') {
        window.transitive.focusJourney(model.id);
      } else {
        window.transitive.focusJourney();
      }
    });
});

/**
 * Detail template
 */

var detail = hogan.compile(require('./detail.html'));

/**
 * Details
 */

View.prototype.segments = function() {
  var segments = this.model.segments;
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
    switch (this.model.mode) {
      case 'bicycle':
        details += this.narrativeDirections('bike', 'Bike');
        break;
      case 'car':
        details += this.narrativeDirections('car', 'Drive');
        break;
      case 'walk':
        details += this.narrativeDirections('pedestrian', 'Walk');
        break;
    }
  } else {
    // Final Walk Segment
    addDetail({
      description: 'Walk ' + (this.model.finalWalkTime / 60 | 0) +
        ' mins',
      type: 'pedestrian',
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
  var steps = this.model.walkSteps;

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
  return Math.round(this.model.time);
};

/**
 * Fare
 */

View.prototype.fare = function() {
  switch (this.model.mode) {
    case 'car':
      return '$' + this.model.totalCost.toFixed(2);
    case 'bicycle':
      return (this.model.calories | 0) + ' cals';
    case 'walk':
      return (this.model.calories | 0) + ' cals';
    default:
      return '$' + this.model.totalCost.toFixed(2);
  }
};

/**
 * Pollution
 */

View.prototype.pollution = function() {
  return this.model.mode === 'car' ? this.model.emissions | 0 : false;
};

/**
 * Pollution Offset
 */

View.prototype.pollutionOffset = function() {
  return this.model.mode === 'bicycle' || this.model.mode === 'walk' ? this.model
    .emissions | 0 : false;
};

/**
 * Distance
 */

View.prototype.distance = function() {
  return convert.milesToString(this.model.totalDistance);
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
  this.find('.details').classList.toggle('hidden');
  this.find('.segments').classList.toggle('hidden');
};

/**
 * Frequency
 */

View.prototype.frequency = function() {
  return Math.round(this.model.frequency);
};

/**
 * Simple Template
 */

var simpleTemplate = hogan.compile(require('./simple.html'));

/**
 * Simple Segments
 */

View.prototype.simpleSegments = function() {
  var route = this.model;
  var total = route.stats.avg;
  var segments = '';

  // If no segments, return the single mode
  if (route.segments.length === 0) {
    var opts = {
      backgroundColor: '#5ae3f9',
      svg: svg('pedestrian'),
      width: 100
    };

    if (route.summary === 'Bicycle') {
      opts.svg = svg('bike');
    } else if (route.summary === 'Car') {
      opts.svg = svg('car');
    }

    return simpleTemplate.render(opts);
  }

  route.segments.forEach(function(segment) {
    // Add Walk Segment
    segments += simpleTemplate.render({
      backgroundColor: '#5ae3f9',
      svg: svg('pedestrian'),
      width: segment.walkTime / total * 100
    });

    var opts = {
      backgroundColor: 'gray',
      text: segment.routeShortName,
      width: (segment.waitStats.avg + segment.rideStats.avg) / total * 100
    };

    if (segment.mode !== 'BUS')
      opts.backgroundColor = segment.routeShortName.toLowerCase();

    segments += simpleTemplate.render(opts);
  });

  segments += simpleTemplate.render({
    backgroundColor: '#5ae3f9',
    svg: svg('pedestrian'),
    width: route.finalWalkTime / total * 100
  });

  return segments;
};
