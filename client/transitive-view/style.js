/**
 * Dependencies
 */

var parse = require('color-parser');

/**
 * Expose pattern styles
 */

exports.segments = {
  stroke: function(display, data) {
    if (data.type === 'TRANSIT') {
      if (parse(data.pattern.route_id)) {
        return toBSColor(data.pattern.route_id.toLowerCase());
      } else {
        return '#999';
      }
    }
    return '#ddd';
  },
  'stroke-dasharray': function(display, data) {
    if (data.type !== 'TRANSIT') {
      return '10, 5';
    }
  },
  'stroke-linecap': [
    'round',
    function(display, data) {
      if (!data.otpSegment) {
        return 'butt';
      }
    }
  ]
};

/**
 * Expose stop styles
 */

exports.stops = {
  r: [

    function(display, data, index, utils) {
      return utils.pixels(display.zoom.scale(), 2, 4, 8) + 'px';
    },
    function(display, data, index, utils) {
      if (data.point.isSegmentEndPoint) {
        return utils.pixels(display.zoom.scale(), 2, 4, 8) + 'px';
      }
    },
    function(display, data, index, utils) {
      if (data.point.isEndPoint) {
        return utils.pixels(display.zoom.scale(), 3, 6, 12) + 'px';
      }
    }
  ],
  stroke: '#444',
  'stroke-width': [

    function(display, data, index, utils) {
      return utils.pixels(display.zoom.scale(), 0.5, 1, 2) + 'px';
    },
    function(display, data, index, utils) {
      if (data.point.isSegmentEndPoint) {
        return utils.pixels(display.zoom.scale(), 1, 2, 4) + 'px';
      }
    },
    function(display, data, index, utils) {
      if (data.point.isEndPoint) {
        return utils.pixels(display.zoom.scale(), 2, 4, 8) + 'px';
      }
    }
  ]
};

/**
 * Expose label styles
 */

exports.labels = {
  x: function(display, data, index, utils) {
    var width = utils.strokeWidth(display);
    if (data.stop && data.stop.isEndPoint) {
      width *= data.stop.renderData.length;
    }
    return Math.sqrt(width * width * 2) * (data.stop && data.stop.labelPosition ?
      data.stop.labelPosition : -1) + 'px';
  },
  y: function(display, data, index, utils) {
    return utils.fontSize(display, data) / 2 * -(data.stop && data.stop.labelPosition ?
      data.stop.labelPosition : -1) + 'px';
  },
  'font-size': '12px',
  'text-transform': 'uppercase',
  'font-family': 'Helvetica',
  transform: function(display, data) {
    if (data.stop) {
      if (data.stop.isEndPoint) {
        return '';
      } else {
        var angle = data.stop.angle;
        if (angle > 0) angle = 45 - angle;
        else angle -= 45;
        return 'rotate(' + angle + ', 0, 0)';
      }
    }
  }
};

/**
 * TO BSColor
 */

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
