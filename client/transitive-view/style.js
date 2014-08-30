var config = require('config');
var convert = require('convert');
var parse = require('color-parser');

exports.places = {
  fill: 'none'
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
        return '#f00';

    }
  },

  // override the default stroke width
  'stroke-width': function(display, segment, index, utils) {
    switch (segment.type) {
      case 'CAR':
        return utils.pixels(display.zoom.scale(), 3, 5, 7) + 'px';
      case 'WALK':
      case 'BICYCLE':
        return '5px';
      case 'TRANSIT':
        // bus segments:
        if (segment.mode === 3) return utils.pixels(display.zoom.scale(), 2, 5, 8) + 'px';
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
      case 'BICYCLE':
        return '0.01,8';
    }
  },

  // specify the line cap type
  'stroke-linecap': function(display, segment) {
    switch (segment.type) {
      case 'CAR':
        return 'butt';
      case 'WALK':
      case 'BICYCLE':
        return 'round';
    }
  }

  // specify the circle marker for 'dotted' line styles
  /*'marker-mid': function(display, segment, index, utils) {
    var radius, fillColor;

    switch (segment.type) {
      case 'WALK':
        radius = 3;
        fillColor = '#5ae3f9';
        return utils.defineSegmentCircleMarker(display, segment, radius,
          fillColor);
      case 'BICYCLE':
        radius = 2;
        fillColor = '#f00';
        return utils.defineSegmentCircleMarker(display, segment, radius,
          fillColor);
    }
  },

  // specify the spacing for marker styling
  'marker-spacing': function(display, segment) {
    switch (segment.type) {
      case 'WALK':
        return 8;
      case 'BICYCLE':
        return 6;
    }
  }*/

};


/** style overrides for segment-based labels **/

exports.segment_label_containers = {

  // specify the fill color for the label bubble
  fill: function(display, label) {
    if(!label.isFocused()) return;

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
      '/build/planner-app/transitive-view/start.svg';
    if (data.owner.getId() === 'to') return config.static_url() +
      '/build/planner-app/transitive-view/end.svg';
  },
  stroke: 1,
  visibility: 'visible'
};

exports.multipoints_merged = exports.stops_merged = {
    r: function(display, data, index, utils) {
      return utils.pixels(display.zoom.scale(), 4, 6, 8);
    }
};
