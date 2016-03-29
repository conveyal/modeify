var convert = require('convert');
var hogan = require('hogan.js');
//var transitive = require('transitive');

var template = hogan.compile(require('./template.html'));

module.exports = function(route, opts) {
  opts = opts || {};

    function isTransit(mode) {
        return (mode !== 'WALK' && mode !== 'CAR' && mode !== 'BICYCLE');
    }

/*  var segments = [];
    var legs = route.attrs.plan.legs;
    for (var i = 0; i < legs.length; i++) {
	if (!isTransit(legs[i].mode) && (i + 1) < legs.length && i > 0) {
	    continue;
	}
        segments.push({
            background: '#fff',
            mode: convert.modeToIcon(legs[i].mode),
            inline: !!opts.inline,
            small: !!opts.small,
        })
    }

  return segments
    .map(function(s) {
      return template.render(s);
    })
    .join('');

  var accessMode = route.access()[0].mode.toLowerCase();
  var accessModeIcon = convert.modeToIcon(accessMode);
  var egress = route.egress();
  var transitSegments = route.transit();
*/

  var legs = route.plan().legs;
  var accessMode = legs[0].mode.toLowerCase();
  var accessModeIcon = convert.modeToIcon(accessMode);
  var egress = legs[legs.length - 1];
  var segments = [];
  var transitLegs = [];

  for (var i = 0; i < legs.length; i++) {
    if (isTransit(legs[i].mode)) {
      transitLegs.push(legs[i]);
    }
  }

  if (transitLegs.length < 1 && accessMode === 'car') {
    accessModeIcon = convert.modeToIcon('carshare');
  }

  segments.push({
    mode: accessModeIcon,
    //style: getModeStyles(accessMode),
    inline: !!opts.inline,
    small: !!opts.small,
    svg: true
  });

  segments = segments.concat(transitLegs.map(function (leg) {
    var background = '#333';
    var name = leg.routeShortName;

    if (!leg.routeShortName) {
      if (leg.agencyId === 'caltrain-ca-us') {
        switch (leg.routeId) {
          case 'Bu-121':
            name = 'BUL';
            break;
          case 'Lo-121':
            name = 'LOC';
            break;
          case 'Li-121':
            name = 'LIM';
            break;
          case 'TaSj-121':
            name = 'TSJ';
            break;
        }
      } else if (leg.agencyId === '123') {
        name = '123';
      } else {
        name = 'BAR';
      }
    }

    return {
      background: background,
      mode: convert.modeToIcon(leg.mode),
      inline: !!opts.inline,
      small: !!opts.small,
      name: name
    }
  }));

/*  segments = segments.concat(transitSegments.map(function(segment) {
    var patterns = segment.segmentPatterns.filter(patternFilter('color'));
    var background = patterns[0].color;
    var longNamePatterns = segment.segmentPatterns.filter(patternFilter('longName')),
      caltrainNames = ['Local', 'Limited', 'Bullet', 'LOCAL', 'LIMITED', 'BULLET'];

    for (var i = 0; i < longNamePatterns.length; i++) {
      if (caltrainNames.indexOf(longNamePatterns[i].longName) !== -1) {
        patterns[0].shield = 'CAL';
      }
    }

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

    return {
      background: background,
      mode: convert.modeToIcon(segment.mode),
      inline: !!opts.inline,
      small: !!opts.small,
      name: patterns[0].shield
    };
  }));
*/
  if (egress) {
    var egressMode = egress.mode.toLowerCase();
    if (egressMode !== 'walk') {
      segments.push({
        mode: convert.modeToIcon(egressMode),
        //style: getModeStyles(egressMode),
        inline: !!opts.inline,
        small: !!opts.small,
        svg: true
      });
    }
  }

  return segments
    .map(function(s) {
      return template.render(s);
    })
    .join('');
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

//function getModeStyles(mode) {
//  var styles = transitive.getModeStyles(mode.toUpperCase());
//  var s = '';
//  for (var i in styles) {
//    s += i + ':' + styles[i] + ';';
//  }
//  return s;
//}
