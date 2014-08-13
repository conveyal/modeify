var colorParser = require('color-parser');
var convert = require('convert');
var d3 = require('d3');
var domify = require('domify');
var hogan = require('hogan.js');
var luminosity = require('luminosity');
var session = require('session');
var toSentenceCase = require('to-sentence-case');
var view = require('view');

/**
 * Constants
 */

var METERS_TO_MILES = 0.000621371;

/**
 * Templates
 */

var detailTemplate = hogan.compile(require('./detail.html'));
var simpleTemplate = hogan.compile(require('./simple.html'));

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
 * Details, details
 */

View.prototype.segments = function() {
  var segments = this.model.transit();
  var details = '';

  // Add a detail
  function addDetail(d) {
    details += detailTemplate.render(d);
  }

  // Add access segment
  var access = this.model.access()[0];
  switch (access.mode.toLowerCase()) {
    case 'bicycle':
      details += narrativeDirections('bike', 'Bike', access.walkSteps);
      break;
    case 'car':
      details += narrativeDirections('car', 'Drive', access.walkSteps);
      break;
    case 'walk':
      details += narrativeDirections('walk', 'Walk', access.walkSteps);
      break;
  }

  // Add transit segments
  var length = segments.length;
  for (var i = 0; i < length; i++) {
    var segment = segments[i];

    // Check for a walking distance
    if (segment.walkTime !== 0) {
      addDetail({
        description: 'Walk ' + Math.round(segment.walkTime / 60) + ' min',
        type: 'walk',
        iconSegment: true
      });

      addDetail({
        description: segment.fromName,
        type: 'transfer',
        transfer: true
      });
    }

    addDetail({
      description: 'Take <strong>' + segment.shortName + '</strong>',
      color: segment.color,
      time: Math.round(segment.rideStats.avg / 60),
      type: modeToIcon(segment.mode),
      segment: true
    });

    addDetail({
      description: segment.toName,
      type: 'transfer',
      transfer: true
    });
  }

  var egress = this.model.egress();
  if (egress && egress.length > 0) {
    // Final Walk Segment
    addDetail({
      description: 'Walk ' + (egress[0].time / 60 | 0) +
        ' min',
      type: 'walk',
      iconSegment: true
    });
  }

  return details;
};

/**
 * Add narrative directions
 */

function narrativeDirections(type, action, steps) {
  // Add initial narrative step
  var narrative = detailTemplate.render({
    description: ndescription(action, steps[0].absoluteDirection.toLowerCase(),
      steps[0].distance, steps[0].streetName),
    iconSegment: true,
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

    narrative += detailTemplate.render({
      description: toSentenceCase(steps[i].relativeDirection) + ' on ' +
        steps[i].streetName + ' for ' + convert.metersToMiles(steps[i].distance) +
        ' mi',
      direction: iconDirection
    });
  }

  return narrative;
}

/**
 * Average trip length in minutes
 */

View.prototype.average = function() {
  return Math.round(this.model.time());
};

/**
 * Cost
 */

View.prototype.calculatedCost = function() {
  if (this.model.cost() === 0) return false;
  var total = this.model.cost() * this.model.days();
  return total > 1000
    ? (total / 1000).toFixed(0) + 'k'
    : total.toFixed(0);
};

/**
 * Calories
 */

View.prototype.calculatedCalories = function() {
  if (this.model.calories() === 0) return false;
  var total = this.model.calories() * this.model.days();
  return total > 1000
    ? (total / 1000).toFixed(0) + 'k'
    : total.toFixed(0);
};

/**
 * Frequency
 */

View.prototype.frequency = function() {
  var trips = this.model.trips();
  if (!trips) return false;

  var plan = session.plan();
  var start = plan.start_time();
  var end = plan.end_time();

  return Math.round(trips / (end - start));
};

/**
 * Walk/Bike distances rounded
 */

View.prototype.driveDistance = function() {
  if (this.model.modes().indexOf('car') === -1) return false;
  return Math.round(convert.metersToMiles(this.model.driveDistance()) * 2) / 2;
};

View.prototype.bikeDistance = function() {
  if (this.model.modes().indexOf('bicycle') === -1) return false;
  return Math.round(convert.metersToMiles(this.model.bikeDistance()) * 2) / 2;
};

View.prototype.walkDistance = function() {
  if (this.model.modes().indexOf('walk') === -1) return false;
  return Math.round(convert.metersToMiles(this.model.walkDistance()) * 2) / 2;
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
 * Simple Segments
 */

View.prototype.simpleSegments = function() {
  var accessMode = this.model.access()[0].mode.toLowerCase();
  var html = '';
  var segments = this.model.transit();

  if (accessMode !== 'walk' || segments.length === 0) {
    html += simpleTemplate.render({
      color: 'transparent',
      mode: modeToIcon(accessMode),
      name: ' '
    });
  }

  segments.forEach(function(segment) {
    var rgb = [ 192, 192, 192 ];
    if (segment.color) {
      rgb = colorParser(segment.color);
      rgb = [rgb.r, rgb.g, rgb.b];
    } else {
      segment.color = 'gray';
    }

    html += simpleTemplate.render({
      color: segment.color,
      light: luminosity.light(rgb) ? 'light' : 'dark',
      mode: modeToIcon(segment.mode),
      name: segment.shield
    });
  });

  return html;
};

/**
 * Has what?
 */

View.prototype.hasCost = function() {
  return this.model.cost() > 0;
};

View.prototype.hasCar = function() {
  return this.model.modes().indexOf('car') !== -1;
};

View.prototype.hasTransit = function() {
  return this.model.transit().length > 0;
};

View.prototype.hasBiking = function() {
  return this.model.modes().indexOf('bicycle') !== -1;
};

View.prototype.hasWalking = function() {
  return this.model.modes().indexOf('walk') !== -1;
};

/**
 * TODO: this should be aliased in CSS
 */

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

/**
 * Get a narrative description
 */

function ndescription(a, dir, dis, st) {
  return a + ' ' + dir + ' on ' + st + ' for ' + convert.metersToMiles(dis) +
    ' mi';
}
