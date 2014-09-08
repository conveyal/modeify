var colorParser = require('color-parser');
var convert = require('convert');
var d3 = require('d3');
var domify = require('domify');
var Feedback = require('feedback-modal');
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
      var id = model.id() + '';
      if (id.indexOf('transit') === -1) id = id + '_' + model.access()[0].mode.toLowerCase();
      window.transitive.focusJourney(id);
    });

  Array.prototype.slice.call(view.findAll('input')).forEach(setInputSize);
});

/**
 * View
 */

View.prototype.feedback = function(e) {
  e.preventDefault();
  Feedback(this.model).show();
};

/**
 * Details, details
 */

View.prototype.segments = function() {
  var segments = this.model.transit();
  var length = segments.length;
  var details = '';

  // Add a detail
  function addDetail(d) {
    details += detailTemplate.render(d);
  }

  // Add access segment
  var access = this.model.access()[0];
  switch (access.mode.toLowerCase()) {
    case 'bicycle':
      details += narrativeDirections('bike', 'Bike', access.walkSteps, length !==
        0);
      break;
    case 'car':
      details += narrativeDirections('car', 'Drive', access.walkSteps, length !==
        0);
      break;
    case 'walk':
      details += narrativeDirections('walk', 'Walk', access.walkSteps, length !==
        0);
      break;
  }

  // Add transit segments
  var transferType = true;
  var lastColor = null;
  for (var i = 0; i < length; i++) {
    var segment = segments[i];
    var patterns = segment.segmentPatterns;
    var color = patterns[0].color;

    // Check for a walking distance to see if you are boarding or transferring
    if (segment.walkTime !== 0) {
      if (i > 0) {
        addDetail({
          description: 'Walk ' + Math.ceil(segment.walkTime / 60) + ' min',
          icon: 'walk'
        });
      }

      addDetail({
        color: color,
        description: strong(segment.fromName),
        transfer: 'transfer board'
      });
    } else {
      addDetail({
        color: 'linear-gradient(to bottom, ' + lastColor + ' 0%, ' +
          lastColor + ' 50%,' + color + ' 50%, ' + color + ' 100%)',
        description: strong(segment.fromName),
        transfer: 'transfer'
      });
    }

    addDetail({
      color: color,
      description: 'Take ' + patterns.filter(patternFilter()).map(
        patternDescription).join(' / '),
      segment: true
    });

    // Check if you are debaording
    if (i + 1 >= length || segments[i + 1].walkTime > 0) {
      addDetail({
        color: color,
        description: strong(segment.toName),
        transfer: 'transfer alight'
      });
    }

    lastColor = color;
  }

  var egress = this.model.egress();
  if (egress && egress.length > 0) {
    // Final Walk Segment
    addDetail({
      description: 'Walk ' + (egress[0].time / 60 | 0) +
        ' min',
      icon: 'walk'
    });
  }

  return details;
};

/**
 * Pattern filter
 */

function patternFilter(by) {
  by = by || 'shortName';
  var names = [];
  return function(p) {
    if (names.indexOf(p[by]) === -1) {
      names.push(p[by]);
      return true;
    } else {
      return false;
    }
  };
}

/**
 * Pattern description
 */

function patternDescription(p, i) {
  return '<strong style="color: ' + p.color + ';">' + p.shortName + '</strong>';
}

function strong(s) {
  return '<strong>' + s + '</strong>';
}

/**
 * Add narrative directions
 */

function narrativeDirections(type, action, steps) {
  // Add initial narrative step
  var narrative = detailTemplate.render({
    description: ndescription(action, steps[0].absoluteDirection.toLowerCase(),
      steps[0].distance, steps[0].streetName),
    icon: type
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
      background: 'transparent',
      mode: modeToIcon(accessMode),
      name: ' '
    });
  }

  segments.forEach(function(segment) {
    var patterns = segment.segmentPatterns.filter(patternFilter('color'));
    var background = patterns[0].color;
    if (patterns.length > 0) {
      var percent = 0;
      var increment = 1 / patterns.length * 100;
      background = 'linear-gradient(to right';
      for (var i = 0; i < patterns.length; i++) {
        var color = patterns[i].color;
        background += ',' + color + ' ' + percent + '%, ' + color + ' ' + (
          percent + increment) + '%';
        percent += increment;
      }
      background += ')';
    }

    html += simpleTemplate.render({
      background: background,
      mode: modeToIcon(segment.mode),
      name: patterns[0].shield
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
      case 'parkingCost':
        scorer.rates.parkingCost = value;
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
  var length = i.value.length;
  i.setAttribute('size', length > 2 ? length - 2 : 1);
}

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
