var config = require('config');
var convert = require('convert');
var parse = require('color-parser');

exports.segments = {
  stroke: function(display, segment) {
    if (!segment.focused) return;

    switch (segment.type) {
      case 'CAR':
        return '#888';
      case 'WALK':
        return 'none';
      case 'TRANSIT':
        var route = segment.patterns[0].route;
        var id = route.route_id.split(':');
        return convert.routeToColor(route.route_type, id[0].toLowerCase(), id[1]
          .toLowerCase(), route.route_color);
    }
  }
};

exports.places = {
  stroke: 1
};

exports.places_icon = {
  x: -8,
  y: -8,
  width: 16,
  height: 16,
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
