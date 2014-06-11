var convert = require('convert');
var d3 = require('d3');
var domify = require('domify');
var session = require('session');
var svg = require('svg-icons');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view,
  model) {

});

/**
 * Detail template
 */

var template = require('../detailed/detail.html');
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

    var description = '<p>' + segment.fromName + '</p>' + '<p>&nbsp;</p>' +
      '<p>' + segment.toName + '</p>';

    addDetail({
      description: description,
      icon: svg(segment.type),
      name: (segment.routeShortName ? segment.routeShortName.toUpperCase() :
        ''),
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

View.prototype.from = function() { return session.plan().from(); };
View.prototype.to = function() { return session.plan().to(); };


/**
 * Show/hide
 */

View.prototype.showHide = function() {
  this.find('.detailed').classList.toggle('hidden');
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
