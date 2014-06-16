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

    var color = segment.type === 'train' ? convert.toBSColor(segment.routeShortName) :
      'gray';

    addDetail({
      description: segment.routeShortName,
      color: color,
      time: Math.round(segment.rideStats.avg / 60),
      type: segment.type,
      segment: true
    });

    addDetail({
      description: segment.toName,
      type: 'transfer',
      transfer: true
    })
  }

  if (segments.length === 0) {
    // One mode the entire way
    switch (this.model.summary) {
      case 'Bicycle':
        addDetail({
          description: 'Bike ' + Math.round(this.model.finalWalkTime / 60) + ' mins',
          type: 'bike',
          segment: true
        });
        break;
      case 'Car':
        addDetail({
          description: 'Drive ' + Math.round(this.model.finalWalkTime / 60) + ' mins',
          type: 'car',
          segment: true
        });
        break;
      case 'Walk':
        addDetail({
          description: 'Walk ' + Math.round(this.model.finalWalkTime / 60) + ' mins',
          type: 'pedestrian',
          segment: true
        });
        break;
    }
  } else {
    // Final Walk Segment
    addDetail({
      description: 'Walk ' + Math.round(this.model.finalWalkTime / 60) + ' mins',
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
  return '$2.10';
};

/**
 * To/from
 */

View.prototype.from = function() { return session.plan().from().split(',')[0]; };
View.prototype.to = function() { return session.plan().to().split(',')[0]; };


/**
 * Show/hide
 */

View.prototype.showHide = function() {
  this.find('.details').classList.toggle('hidden');
  this.find('.segments').classList.toggle('hidden');
};

/**
 * Simple Segments
 */

View.prototype.simpleSegments = function() {
  var route = this.model;
  var total = route.stats.avg;
  var segments = '';

  route.segments.forEach(function(segment) {
    // Add Walk Segment
    segments += singleSegment('pedestrian', segment.walkTime / total * 100);

    // Add Transit Segment
    segments += singleSegment(segment.mode, (segment.waitStats.avg + segment.rideStats.avg) / total * 100, segment.routeShortName);
  });

  /* Add the final walking segment if it's significant */
  if (route.segments.length === 0) {
    if (route.summary === 'Bicycle') {
      segments += singleSegment('bike', 100);
    } else if (route.summary === 'Car') {
      segments += singleSegment('car', 100);
    } else {
      segments += singleSegment('pedestrian', 100);
    }
  } else {
    segments += singleSegment('pedestrian', route.finalWalkTime / total * 100);
  }

  return segments;
};

/**
 * Create Walk Segment
 */

function singleSegment(type, width, text) {
  var html = '<div class="segment" style="width:';
  html += width + '%;';

  switch(type) {
    case 'BUS':
      html += 'background-color:gray;"><div class="inner-text">' + text + '</div></div>';
      break;
    case 'SUBWAY':
      html += 'background-color:' + text.toLowerCase() + ';"><div class="inner-text">' + text + '</div></div>';
      break;
    default:
      html += '">' + svg(type) + '</div>';
      break;
  }

  return html;
}
