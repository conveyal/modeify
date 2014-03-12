/**
 * Dependencies
 */

var convert = require('convert');
var d3 = require('d3');
var each = require('each');
var session = require('session');
var toCapitalCase = require('to-capital-case');
var view = require('view');

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

  //
  var paths = [];

  model.segments.forEach(function(segment) {
    paths.push({
      text: '&nbsp;',
      bg: '#f5f5f5',
      color: '#333',
      time: segment.walkTime
    });
    paths.push({
      type: segment.type,
      text: segment.routeShortName,
      bg: segment.routeShortName,
      color: '#fff',
      time: segment.waitStats.min + segment.rideStats.min
    });
  });

  paths.push({
    text: '&nbsp;',
    bg: '#f5f5f5',
    color: '#333',
    time: model.finalWalkTime
  });

  d3.select(view.el)
    .select('.segments')
    .selectAll('.segment')
    .data(paths)
    .enter()
    .append('div')
    .attr('class', 'segment')
    .style('color', function(d) {
      return d.color;
    })
    .style('background-color', function(d) {
      if (d.type === 'train') {
        return convert.toBSColor(d.bg);
      } else if (d.type === 'bus') {
        return '#ccc';
      }
      return d.bg;
    })
    .style('width', function(d) {
      return width(d.time);
    })
    .html(function(d) {
      return d.text;
    });
});

/**
 * Get the max trip length
 */

function maxTripLength() {
  var profile = session.plan().routes();
  return profile[profile.length - 1].stats.min;
}

/**
 * Average Time
 */

View.prototype.average = function() {
  return Math.round(this.model.stats.avg / 60);
};

/**
 * Minimum
 */

View.prototype.minimum = function() {
  return Math.round(this.model.stats.min / 60);
};

/**
 * Wait time
 */

View.prototype.wait = function() {
  return Math.round(this.model.segments.reduce(function(time, segment) {
    return time + segment.waitStats.avg;
  }, 0) / 60);
};

/**
 * Difference color
 */

View.prototype.diffcolor = function() {
  var stats = this.model.stats;
  return diffcolor(stats.avg / 60 - stats.min / 60);
};

/**
 * Summary
 */

View.prototype.summary = function() {
  var segments = this.model.segments;
  var summary = '<div class="segment">Walk to ' + segments[0].fromName +
    '</div>';
  var length = segments.length;
  var to = session.plan().to();

  for (var i = 0; i < length; i++) {
    summary += '<div class="segment"><span class="svg-icon svg-icon-' +
      segments[i].type + '"></span>' + segments[i].routeShortName + ' from ' +
      segments[i].fromName + ' to ' + segments[i].toName + '</div>';
  }

  summary += '<div class="segment">Walk from ' + segments[length - 1].toName +
    ' to ' + to.slice(0, to.indexOf(',')) + '</div>';

  return summary;
};

/**
 * Transfers
 */

View.prototype.transfers = function() {
  return this.model.segments.length - 1;
};

/**
 * Miles
 */

View.prototype.miles = function() {
  return convert.metersToMiles(this.model.segments.reduce(function(mi, d) {
    return mi + d.walkTime / 1.4;
  }, this.model.finalWalkTime / 1.4));
};
