var config = require('config');
var convert = require('convert');
var parse = require('color-parser');


exports.segments = {
  stroke: function(display, segment) {
    if (!segment.focused) return;

// taking this value and testing other values for that property //
    switch (segment.type) {
      case 'CAR':
        return '#510E61';
      case 'WALK':
        return 'none';
      case 'TRANSIT':
        var route = segment.patterns[0].route;
        var id = route.route_id.split(':');
        return convert.routeToColor(route.route_type, id[0].toLowerCase(), id[1]
          .toLowerCase(), route.route_color);
    }
  },

    // override the default stroke width
  'stroke-width': function(display, segment, index, utils) {
    switch (segment.type) {
      case 'CAR':
        return utils.pixels(display.zoom.scale(), 2, 4, 6) + 'px';
      case 'TRANSIT':
        // bus segments:
        if (segment.mode === 3) return utils.pixels(display.zoom.scale(), 2, 4, 8) + 'px';
        // all others:
        return utils.pixels(display.zoom.scale(), 4, 8, 12) + 'px';
    }
  },

   // specify the dash-array
  'stroke-dasharray': function(display, segment) {
    switch (segment.type) {
      case 'CAR':
        return '8,3';
    }
  },

   // specify the line cap type
  'stroke-linecap' : function(display, segment) {
    switch (segment.type) {
      case 'CAR':
        return 'butt';
    }
  },

    // specify the circle marker for 'dotted' line styles
  'marker-mid': function(display, segment, index, utils) {
    var radius, fillColor;

    switch(segment.type) {
      case 'WALK':
        radius = 3;
        fillColor = '#5ae3f9';
        break;
        // return utils.defineSegmentCircleMarker(display, segment, radius, fillColor);
      case 'BICYCLE':
        radius = 2;
        fillColor = '#f00';
        break;
        // return utils.defineSegmentCircleMarker(display, segment, radius, fillColor);
    }
  },

  // specify the spacing for marker styling
  'marker-spacing': function(display, segment) {
    switch(segment.type) {
      case 'WALK':
        return 8;
      case 'BICYCLE':
        return 6;
    }
  },

  // specify the circle marker for 'dotted' line styles
  'marker-mid': function(display, segment, index, utils) {
    var radius, fillColor;

    switch(segment.type) {
      case 'WALK':
        radius = 10;
        fillColor = '#5ae3f9';
        return utils.defineSegmentCircleMarker(display, segment, radius, fillColor);
      case 'BICYCLE':
        radius = 2;
        fillColor = '#f00';
        return utils.defineSegmentCircleMarker(display, segment, radius, fillColor);
    }
  },

  // specify the spacing for marker styling
  'marker-spacing': function(display, segment) {
    switch(segment.type) {
      case 'WALK':
        return 8;
      case 'BICYCLE':
        return 6;
    }
  }
};

// start/end icons and eventually points of interest//

exports.places_icon = {
  x: -16,
  y: -16,
  width: 32,
  height: 32,
  'xlink:href': function(display, data) {
    if (data.owner.getId() === 'from') return config.static_url() +
      '/build/planner-app/transitive-view/start.svg';
    if (data.owner.getId() === 'to') return config.static_url() +
      '/build/planner-app/transitive-view/end.svg';
  },
  stroke: 1,
  visibility: 'visible'
};

exports.multipoints_pattern = exports.multipoints_merged = exports.stops_pattern =
  exports.stops_merged = {
    r: function(display, data, index, utils) {
      return utils.pixels(display.zoom.scale(), 4, 6, 8);
    }
};
