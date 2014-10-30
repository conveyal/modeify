var colorParser = require('color-parser');
var luminosity = require('luminosity');

exports.isLight = function(c) {
  var rgb = colorParser(c);
  return luminosity.light([ rgb.r, rgb.g, rgb.b ]);
};
