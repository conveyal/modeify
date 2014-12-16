var convert = require('convert');
var d3 = require('d3');
var Feedback = require('feedback-modal');
var hogan = require('hogan.js');
var RouteComparisonTable = require('route-comparison-table');
var RouteModal = require('route-modal');
var routeSummarySegments = require('route-summary-segments');
var routeResource = require('route-resource');
var session = require('session');
var toSentenceCase = require('to-sentence-case');
var ua = require('user-agent');
var view = require('view');

/**
 * Constants
 */

var METERS_TO_MILES = 0.000621371;

/**
 * Templates
 */

var detailTemplate = hogan.compile(require('./detail.html'));

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view,
  model) {
  d3.select(view.el)
    .on('mouseover', function() {
      var id = model.id() + '';
      if (id.indexOf('transit') === -1) id = id + '_' + model.access()[0]
        .mode.toLowerCase();
      window.transitive.focusJourney(id);
    })
    .on('mouseout', function() {
      if (!view.el.classList.contains('expanded')) {
        window.transitive.focusJourney();
      }
    });

  [].slice.call(view.findAll('input')).forEach(setInputSize);
});

/**
 * Route summary
 */

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
 * Details, details
 */

View.prototype.segmentDetails = function() {
  var segments = this.model.transit();
  var length = segments.length;
  var details = '';

  // Add a detail
  function addDetail(d) {
    details += detailTemplate.render(d);
  }

  // Add access segment
  var access = this.model.access()[0];
  if (access.walkSteps && access.walkSteps.length > 0) {
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
  }

  // Add transit segments
  var transferType = true;
  var lastColor = null;
  for (var i = 0; i < length; i++) {
    var segment = segments[i];
    var patterns = segment.segmentPatterns;
    var color = patterns[0].color;

    // Check for a walking distance to see if you are boarding or transferring
    if (segment.walkTime !== 0 || i === 0) {
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
      description: 'Take ' + patterns.filter(patternFilter()).map(patternDescription).join(' / '),
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
    if (by === 'shortName') {
      p.shortName = p.shortName || p.longName;
    }

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

function patternDescription(p) {
  return '<strong>' + p.shortName + '</strong>';
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

View.prototype.showDetails = function(e) {
  e.preventDefault();
  var el = this.el;
  var expanded = document.querySelector('.option.expanded');
  if (expanded) expanded.classList.remove('expanded');
  el.classList.add('expanded');

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
  if (ua.os.name !== 'iOS')
    size = size > 2 ? size - 2 : 1;
  i.setAttribute('size', size);
}

/**
 * Get a narrative description
 */

function ndescription(a, dir, dis, st) {
  return a + ' ' + dir + ' on ' + st + ' for ' + convert.metersToMiles(dis) +
    ' mi';
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
 * Comparison Table
 */

View.prototype.routeComparisonTable = function() {
  return new RouteComparisonTable(this.model);
};


/**
 * Comparison Table
 */

View.prototype.selectOption = function() {
  routeResource.findByTags(this.model.tags(), (function(err, resources) {
    var routeModal = new RouteModal(this.model, null, { context : 'option', resources : resources});
    routeModal.show();
    routeModal.on('next', function() {
      routeModal.hide();
    });
  }).bind(this));
};
