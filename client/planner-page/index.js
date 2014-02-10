/**
 * Expose `render`
 */

module.exports = function() {};

/**
 * Dependencies
 */

var crossfilter = require('crossfilter').crossfilter;
var config = window.CONFIG;
var d3 = require('d3');
var loc = require('./lib/location');
var Table = require('./lib/table');

/**
 * Max options
 */

var MAX_OPTIONS = 5;

/**
 * Options
 */

var options = crossfilter();

/**
 * Dimensions
 */

var dimensions = window.dimensions = {
  segments: options.dimension(function(d) {
    return d.segments.length;
  }),
  average: options.dimension(function(d) {
    return d.stats.avg;
  }),
  max: options.dimension(function(d) {
    return d.stats.max;
  }),
  min: options.dimension(function(d) {
    return d.stats.min;
  })
};

/**
 * Currently sorted by...
 */

var currentSort;

/**
 * Table
 */

var table = null;

/**
 * Display data
 */

loc.on('change', function(data, od) {
  if (data.options.length < 1) return window.alert('No routes found.');

  $('#results').css('display', 'block');

  options.remove();
  options.add(data.options);

  if (!table) table = new Table(document.querySelector('.data'),
    Object.keys(dimensions.min.bottom(1)[0]));

  window.sortBy(currentSort || 'min', od);
  window.animateTo('results');
});

/**
 * Sort by
 */

window.sortBy = function(dimension, od) {
  var d = dimensions[dimension];
  var data = d.bottom(MAX_OPTIONS * 2);

  table.render(data, od);
  $('.routes-count').html(data.length);
};

/**
 * Animate a scroll to a link
 */

window.animateTo = function(id) {
  $('html, body').animate({
    scrollTop: $('#' + id).offset().top - 50
  }, 500);
};
