var convert = require('convert');
var d3 = require('d3');
var domify = require('domify');
var hogan = require('hogan.js');
var session = require('session');
var svg = require('svg-icons');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view,
  model) {
  d3.select(view.el)
    .on('mouseover', function() {
      window.transitive.focusJourney(model.id);
    });
});

/**
 * Detail template
 */

var template = hogan.compile(require('./detail.html'));
var detail = function(obj) {
  return template.render(obj);
};

/**
 * Details
 */

View.prototype.segments = function() {
  var segments = this.model.segments;
  var details = '';

  // Add a detail
  function addDetail(d) {
    details += detail(d);
  }

  // Add transit segments
  var length = segments.length;
  for (var i = 0; i < length; i++) {
    var segment = segments[i];

    // Check for a walking distance
    if (segment.walkTime !== 0) {
      addDetail({
        description: 'Walk ' + Math.round(segment.walkTime / 60) + ' mins',
        type: 'pedestrian',
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
      description: 'Take <strong>' + segment.routeShortName + '</strong>' ,
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
    switch (this.model.summary) {
      case 'Bicycle':
        addDetail({
          description: 'Bike ' + Math.round(this.model.stats.avg / 60) +
            ' mins',
          type: 'bike',
          segment: true
        });
        break;
      case 'Car':
        addDetail({
          description: 'Drive ' + Math.round(this.model.stats.avg / 60) +
            ' mins',
          type: 'car',
          segment: true
        });
        break;
      case 'Walk':
        addDetail({
          description: 'Walk ' + Math.round(this.model.finalWalkTime / 60) +
            ' mins',
          type: 'pedestrian',
          segment: true
        });
        break;
    }
  } else {
    // Final Walk Segment
    addDetail({
      description: 'Walk ' + Math.round(this.model.finalWalkTime / 60) +
        ' mins',
      type: 'pedestrian',
      segment: true
    });
  }

  return details;
};

/**
 * Average trip length in minutes
 */

View.prototype.average = function() {
  return Math.round(this.model.stats.avg / 60);
};

/**
 * Fare
 */

View.prototype.fare = function() {
  if (this.model.fares && this.model.fares.length > 0) {
    var total = this.model.fares.reduce(function(total, fare) {
      return total + fare.peak;
    }, 0);
    return '$' + total.toFixed(2);
  } else {
    switch (this.model.summary) {
      case 'Car':
        if (this.model.walkSteps) {
          var distance = this.model.walkSteps.reduce(function(total, step) {
            return total + step.distance;
          }, 0);
          return '$' + (convert.metersToMiles(distance) * 0.56).toFixed(2);
        }
        return '';
      case 'Bicycle':
        return ((this.model.stats.avg / 60 * 4.4) | 0) + ' cals';
      case 'Walk':
        return ((this.model.stats.avg / 60 * 4.4) | 0) + ' cals';
    }
  }
  return '';
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
    svg: svg('pedestrian')  ,
    width: route.finalWalkTime / total * 100
  });

  return segments;
};
