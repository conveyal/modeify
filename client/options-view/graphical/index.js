/**
 * Dependencies
 */

var convert = require('convert');
var d3 = require('d3');
var session = require('session');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view, model) {

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
      bg: 'lightgrey',
      color: '#333',
      time: segment.walkTime
    });
    paths.push({
      text: segment.routeShortName,
      bg: segment.routeShortName,
      color: 'white',
      time: segment.waitStats.min + segment.rideStats.min
    });
  });

  paths.push({
    text: '&nbsp;',
    bg: 'lightgrey',
    color: '#333',
    time: model.finalWalkTime
  });

  d3.select(view.el)
    .selectAll('.segment')
    .data(paths)
    .enter()
    .append('div')
    .attr('class', 'segment')
    .style('color', function(d) {
      return d.color;
    })
    .style('background-color', function(d) {
      return convert.toBSColor(d.bg) || '#666';
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
