var convert = require('convert');
var hogan = require('hogan.js');
var transitive = require('transitive');

var template = hogan.compile(require('./template.html'));

module.exports = function(route, opts) {
  opts = opts || {};

  var accessMode = route.access()[0].mode.toLowerCase();
  var segments = '';
  var transitSegments = route.transit();

  if (transitSegments.length < 1 && accessMode === 'car') accessMode = 'carshare';

  segments += template.render({
    mode: convert.modeToIcon(accessMode),
    style: getModeStyles(route.access()[0].mode),
    inline: !!opts.inline,
    small: !!opts.small,
    svg: true
  });

  transitSegments.forEach(function(segment) {
    var patterns = segment.segmentPatterns.filter(patternFilter('color'));
    var background = patterns[0].color;

    if (patterns.length > 0) {
      var percent = 0;
      var increment = 1 / patterns.length * 100;
      background = 'linear-gradient(to right';
      for (var i = 0; i < patterns.length; i++) {
        var color = patterns[i].color;
        background += ',' + color + ' ' + percent + '%, ' + color + ' ' + (percent + increment) + '%';
        percent += increment;
      }
      background += ')';
    }

    segments += template.render({
      background: background,
      mode: convert.modeToIcon(segment.mode),
      inline: !!opts.inline,
      small: !!opts.small,
      name: patterns[0].shield
    });
  });

  return segments;
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

function getModeStyles(mode) {
  var styles = transitive.getModeStyles(mode);
  var s = '';
  for (var i in styles) {
    s += i + ':' + styles[i] + ';';
  }
  return s;
}
