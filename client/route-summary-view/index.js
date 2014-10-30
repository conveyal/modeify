var convert = require('convert');
var hogan = require('hogan.js');
var view = require('view');

var segmentTemplate = hogan.compile(require('./segment.html'));

var View = module.exports = view(require('./template.html'));

View.prototype.segments = function() {
  var accessMode = this.model.access()[0].mode.toLowerCase();
  var segments = '';
  var transitSegments = this.model.transit();

  if (transitSegments.length < 1 && accessMode === 'car') accessMode = 'carshare';

  segments += segmentTemplate.render({
    background: 'transparent',
    mode: convert.modeToIcon(accessMode),
    name: ' '
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
        background += ',' + color + ' ' + percent + '%, ' + color + ' ' + (
          percent + increment) + '%';
        percent += increment;
      }
      background += ')';
    }

    segments += segmentTemplate.render({
      background: background,
      mode: convert.modeToIcon(segment.mode),
      name: patterns[0].shield
    });
  });

  return segments;
};

View.prototype.costSavings = function() {
  return convert.roundNumberToString(this.model.costSavings());
};

View.prototype.timeSavingsAndNoCostSavings = function() {
  return this.model.timeSavings() && !this.model.costSavings();
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
