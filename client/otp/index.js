var config = require('config');
var debug = require('debug')(config.application() + ':otp');
var each = require('each');
var jsonp = require('jsonp');
var Profiler = require('otpprofiler.js');
var request = require('request');
var spin = require('spinner');
var toCapitalCase = require('to-capital-case');

/**
 * Metro Colors
 */

var colors = ['Blue', 'Green', 'Orange', 'Red', 'Yellow'];

/**
 * Create profiler
 */

var profiler = new Profiler({
  host: '/api/otp'
});

/**
 * Expose `profile`
 */

module.exports.profile = function(query, callback) {
  debug('--> profiling %s', JSON.stringify(query));
  var spinner = spin();
  profiler.profile(query, function(err, data) {
    if (!data) {
      data = {
        options: []
      };
    }

    debug('<-- profiled %s options', data.options.length);
    spinner.remove();
    callback(err, process(data));
  });
};

/**
 * Expose `patterns`
 */

module.exports.patterns = function(opts, callback) {
  var spinner = spin();
  profiler.journey(opts, function(err, data) {
    spinner.remove();
    callback(err, data);
  });
};

/**
 * Post process profile data
 */

function process(data) {
  var options = data.options;
  var numOptions = data.options.length;

  // Sort by avg time
  options.sort(function(a, b) {
    return a.stats.avg - b.stats.avg;
  });

  each(options, function(option, index) {
    // TODO: Remove laater
    var addWalkTime = 0;
    var removeSegment = [];

    option.id = 'option_' + index;

    each(option.segments, function(segment, i) {
      // TODO: Fix on server side. Currently removing segments with a zero ride time
      if (segment.rideStats.min === 0) {
        debug('removing segment %s due to a 0 ride time', i);
        addWalkTime = segment.walkTime;
        removeSegment.push(i);
        return;
      }

      // TODO: Remove
      if (addWalkTime) {
        segment.walkTime += addWalkTime;
        addWalkTime = 0;
      }

      segment.type = colors.indexOf(segment.routeShortName) === -1 ? 'bus' :
        'train';

      segment.fromName = format(segment.fromName);
      segment.routeShortName = format(segment.routeShortName);
      segment.toName = format(segment.toName);
    });

    // TODO: Remove
    each(removeSegment, function(i) {
      option.segments.splice(i, 1);
    });

    option.summary = format(option.summary);
  });

  return data;
}

/**
 * Format text
 */

function format(text) {
  if (!text) return;

  // remove metro station
  text = text.replace('METRO STATION', '');

  // remove hypens
  text = text.replace(/-/g, ' ');

  // capitalize correctly
  text = toCapitalCase(text);

  // replace 'Dc*' with 'DC*'
  text = text.replace('Dc', 'DC');

  // process individual words
  return text.split(' ').map(word).join(' ');
}

/**
 * Words that get replaced
 */

var wordReplacementTable = {
  'Mcpherson': 'McPherson',
  'Pi': 'Pike',
  'Sq': 'Square',
  'Nw': 'NW',
  'Ne': 'NE',
  'Se': 'SE',
  'Sw': 'SW',
  'Noma': 'NoMA',
  '(new': '(New'
};

/**
 * Word replacement
 */

function word(w) {
  return wordReplacementTable[w];
}
