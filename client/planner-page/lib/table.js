/**
 * Dependencies
 */

var d3 = require('d3');
var debug = require('debug')('table');
var parseColor = require('color-parser');
var styles = require('./styles');
var computed = require('./computed');
var toTitleCase = require('to-capital-case');
var Transitive = require('transitive.js');
var OtpProfiler = require('otpprofiler.js');

/**
 * Average walk speed = 1.5 meters per second
 */

var WALK_SPEED = 1.5;

/**
 * Expose `Table`
 */

module.exports = Table;

/**
 * Init table
 */

function Table(el, keys) {
  this.el = d3.select(el);
}

/**
 * Render the list
 */

Table.prototype.render = function(list, od) {
  this.el.selectAll('.route').remove();

  var maxTime = d3.max(list, function(d) {
    return d.stats.min;
  });

  var datum = this.el
    .selectAll('.route')
    .data(list);

  var denter = datum.enter()
    .append('a')
    .attr('class', 'route row')
    .attr('data-toggle', 'collapse')
    .attr('data-target', function(d) {
      return '#' + toId(d.summary);
    })
    .on('click', function(data) {
      if (!this.transitive) {
        var self = this;

        var profileResponse = new OtpProfiler.models.OtpProfileResponse({
          'options': data
        });
        var TransitiveLoader = new OtpProfiler.transitive.TransitiveLoader(
          profileResponse, window.CONFIG.OTP_API_URL, function(transiveData) {

            var el = $(self).find('.canvas')[0];
            var transitive = new Transitive(el, transiveData, styles);

            // apply computed behaviors
            transitive.on('render', function(transitive) {
              computed.forEach(function(behavior) {
                behavior(transitive);
              });
            });

            transitive.render();

          }, {
            maxOptions: 1,
            fromLocation: od.from,
            toLocation: od.to
          });
      }
    });

  denter.append('div')
    .attr('class', 'summary col-lg-4 col-md-4 col-sm-4')
    .text(function(d) {
      return d.summary.split(' ').map(function(s) {
        if (s.length < 3 || s === 'via') return s;
        if (s === 'routes') return '';
        return s;
      }).join(' ');
    });

  denter.append('div')
    .attr('class', 'times col-lg-1 col-md-1 col-sm-1')
    .html(function(d) {
      return '<i class="fa fa-clock-o"></i> ' + secondsToMinutes(d.stats.min);
    });

  denter.append('div')
    .attr('class', 'times col-lg-1 col-md-1 col-sm-1')
    .html(function(d) {
      return '<i class="fa fa-heart"></i> ' + metersToMiles(d.segments.reduce(
        function(mi, d) {
          return mi + d.walkTime / 1.4;
        }, d.finalWalkTime / 1.4));
    });

  denter.append('div')
    .attr('class', 'segments col-lg-6 col-md-6 col-sm-6')
    .selectAll('.segment')
    .data(function(d) {
      var paths = [];

      d.segments.forEach(function(segment) {
        paths.push({
          routeShortName: 'lightgrey',
          rideStats: {
            min: segment.walkTime
          }
        });
        paths.push(segment);
      });

      paths.push({
        routeShortName: 'lightgrey',
        rideStats: {
          min: d.finalWalkTime
        }
      });

      return paths;
    })
    .enter()
    .append('div')
    .attr('class', 'segment')
    .style('width', function(d) {
      return d.rideStats.min / maxTime * 100 + '%';
    })
    .style('background-color', function(d) {
      return toBSColor(d.routeShortName);
    })
    .style('color', function(d) {
      if (d.routeShortName === 'lightgrey') return '#efefef';
    })
    .text(function(d) {
      return d.routeShortName || d.route;
    });

  var details = denter.append('div')
    .attr('class', 'clearfix collapse details')
    .attr('id', function(d) {
      return toId(d.summary);
    });

  details.append('hr');

  details.append('div')
    .attr('class', 'canvas');

  details.append('div')
    .attr('class', 'col-lg-3 col-md-3 col-sm-3')
    .html('<h4>Summary</h4>')
    .append('p')
    .text(function(d) {
      return d.summary;
    });

  details.append('div')
    .attr('class', 'col-lg-3 col-md-3 col-sm-3')
    .html('<h4>Trip Time</h4>')
    .append('p')
    .html(function(d) {
      return 'Min: ' + secondsToMinutes(d.stats.min) + '<br>Avg: ' +
        secondsToMinutes(d.stats.avg) + '<br>Max: ' + secondsToMinutes(d.stats
          .max);
    });

  details.append('div')
    .attr('class', 'col-lg-3 col-md-3 col-sm-3')
    .html('<h4>Stops</h4>')
    .append('p')
    .text(function(d) {
      var stops = d.segments.reduce(function(s, c) {
        return s + c.segmentPatterns.length;
      }, 0);
      return 'Stops: ' + stops;
    });

  details.append('div')
    .attr('class', 'col-lg-3 col-md-3 col-sm-3')
    .html('<h4>Segments</h4>')
    .append('p')
    .html(function(d) {
      return d.segments.reduce(function(s, c) {
        return s + (c.routeLongName || c.routeShortName || c.route) +
          '<br>';
      }, '');
    });

  var pre = details.append('pre')
    .attr('class', 'col-lg-12 col-md-12 col-sm-12');

  pre.append('button')
    .attr('class', 'btn btn-block btn-default')
    .text('Show Data')
    .on('click', function() {
      var $code = $(this).parent().find('code');
      if (!this.shown) {
        $code.css('display', 'block');
        this.shown = true;
        this.innerText = 'Hide Data';
      } else {
        $code.css('display', 'none');
        this.shown = false;
        this.innerText = 'Show Data';
      }
    });

  var code = pre.append('code')
    .style('display', 'none')
    .text(function(d) {
      return JSON.stringify(d, null, '  ');
    });

  code.each(function(d) {
    window.hljs.highlightBlock(this);
  });

  $('.route .details').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
  });
};

function secondsToMinutes(s) {
  var m = Math.floor(s / 60);
  var sec = s % 60;
  sec = sec < 10 ? '0' + sec : sec;
  return m + ':' + sec;
}

function metersToMiles(meters) {
  return milesToString(meters * 0.000621371);
}

/**
 * Miles to string
 */

function milesToString(miles) {
  var output;
  if (miles > 100) {
    output = Math.round(miles) + ' mi';
  } else if (miles > 10) {
    output = Math.round(miles * 10) / 10 + ' mi';
  } else if (miles > 0.15) {
    output = Math.round(miles * 100) / 100 + ' mi';
  } else {
    output = Math.round(miles * 5280) + ' ft';
  }
  return output;
}

function toId(s) {
  return s.replace(/\W/g, '');
}

function toBSColor(s) {
  switch (s.toLowerCase()) {
    case 'red':
      return '#d9534f';
    case 'green':
      return '#5cb85c';
    case 'blue':
      return '#428bca';
    case 'yellow':
      return '#ffd247';
    case 'orange':
      return '#f0ad4e';
    case 'lightgrey':
      return '#efefef';
    default:
      return null;
  }
}
