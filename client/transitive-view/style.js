var config = require('config');
var convert = require('convert');
var parse = require('color-parser');

var transitColorTable = {
  red: '#e21836',
  yellow: '#ffd200',
  green: '#00a84f',
  blue: '#0076bf',
  orange: '#f7931d',
  silver: '#a0a2a0'
};

exports.places = {
  fill: 'none'
};

exports.segment_labels = {
  'font-weight': 'bold'
};

exports.segments = {
  // override the default stroke color
  stroke: function(display, segment) {
    if (!segment.focused) return;
    switch (segment.type) {
      case 'CAR':
        return '#888';
      case 'WALK':
        return '#0BC8F4';
      case 'BICYCLE':
        return '#ef3026';
      case 'TRANSIT':
        if (segment.mode === 1 && segment.patterns[0].route.route_short_name) {
          return transitColorTable[segment.patterns[0].route.route_short_name.toLowerCase()];
        }
    }
  },

  // override the default stroke width
  'stroke-width': function(display, segment, index, utils) {
    switch (segment.type) {
      case 'CAR':
        return utils.pixels(display.zoom.scale(), 3, 5, 7) + 'px';
      case 'WALK':
        return '6px';
      case 'BICYCLE':
        return '5px';
      case 'TRANSIT':
        // bus segments:
        if (segment.mode === 3) return utils.pixels(display.zoom.scale(), 2, 5,
          8) + 'px';
        // all others:
        return utils.pixels(display.zoom.scale(), 5, 9, 12) + 'px';
    }
  },

  // specify the dash-array
  'stroke-dasharray': function(display, segment) {
    switch (segment.type) {
      case 'CAR':
        return '3,2';
      case 'WALK':
        return '0.01,10';
      case 'BICYCLE':
        return '3,2';
    }
  },

  // specify the line cap type
  'stroke-linecap': function(display, segment) {
    switch (segment.type) {
      case 'CAR':
        return 'butt';
      case 'WALK':
        return 'round';
      case 'BICYCLE':
        return 'butt';
    }
  }
};

/** style overrides for segment-based labels **/

exports.segment_label_containers = {

  // specify the fill color for the label bubble
  fill: function(display, label) {
    if (!label.isFocused()) return;

    return '#008';
  }
};

// start/end icons and eventually points of interest//

exports.places_icon = {
  x: -20,
  y: -20,
  width: 40,
  height: 40,
  'xlink:href': function(display, data) {
    if (data.owner.getId() === 'from') return config.static_url() +
      '/images/transitive/start.svg';
    if (data.owner.getId() === 'to') return config.static_url() +
      '/images/transitive/end.svg';
  },
  cursor: 'pointer',
  stroke: 0,
  visibility: 'visible'
};

exports.multipoints_merged = exports.stops_merged = {
  r: function(display, data, index, utils) {
    return utils.pixels(display.zoom.scale(), 4, 6, 8);
  }
};
