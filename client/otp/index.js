var config = require('config');
var debug = require('debug')(config.application() + ':otp');
var each = require('each');
var jsonp = require('jsonp');
var profiler = require('otpprofiler.js');
var qs = require('querystring');
var request = require('request');
var spin = require('spinner');
var toCapitalCase = require('to-capital-case');

/**
 * Metro Colors
 */

var colors = ['Blue', 'Green', 'Orange', 'Red', 'Yellow'];

/**
 * Expose `profile`
 */

module.exports.profile = function(query, callback) {
  var str = qs.stringify(query);
  debug('--> profiling %s', str);
  request.get('/otp/profile?' + str, function(err, res) {
    debug('<-- profiled %s options', res.body.options.length);
    callback.call(null, err, process(res.body));
  });
};

/**
 * Expose `profile`
 */

module.exports.patterns = function(profile, opts, callback) {
  var spinner = spin();
  var response = new profiler.models.OtpProfileResponse(profile);
  var loader = new profiler.transitive.TransitiveLoader(response, config.otp_url() +
    '/', function() {
      spinner.remove();
      callback.apply(null, arguments);
    }, opts);
};

/**
 * Post process profile data
 */

function process(data) {
  var options = data.options;
  var numOptions = data.options.length;

  each(options, function(option) {
    // TODO: Remove laater
    var addWalkTime = 0;
    var removeSegment = [];

    each(option.segments, function(segment, i) {
      // TODO: Fix on server side. Currently removing segments with a zero ride time
      if (segment.rideStats.min === 0) {
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

  // add "line" for colored lines
  if (colors.indexOf(text) !== -1 && text.indexOf(' ') === -1) text += ' LINE';

  // capitalize correctly
  text = toCapitalCase(text);

  // process individual words
  return text.split(' ').map(word).join(' ');
}

/**
 * Word replacement
 */

function word(w) {
  switch (w) {
    case 'Mcpherson':
      return 'McPherson';
    case 'Pi':
      return 'Pike';
  }

  // starts with number?
  if (w.match(/^\d/)) return w.toUpperCase();

  return w;
}
