// http://www.w3.org/TR/WCAG20/#relativeluminancedef
// The WCAG luminosity of the color. 0 is black, 1 is white.
var luminosity = exports.luminosity = function (rgb) {
  var lum = rgb.map(function(c){
    var chan = c / 255
    if(chan <= 0.03928) return chan / 12.92
    return Math.pow(((chan + 0.055) / 1.055), 2.4)
  })

  return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2]
}

// http://www.w3.org/TR/WCAG20/#contrast-ratiodef
// The WCAG contrast ratio to another color, from 1 (same color) to 21 (contrast b/w white and black).
var contrast = exports.contrast = function (rgb1, rgb2) {
  var lum1 = luminosity(rgb1)
  var lum1 = luminosity(rgb2)
  if (lum1 > lum2) return (lum1 + 0.05) / (lum2 + 0.05)
  return (lum2 + 0.05) / (lum1 + 0.05)
}

// Get whether the color is "dark", useful for deciding text color.
// YIQ equation from http://24ways.org/2010/calculating-color-contrast
var dark = exports.dark = function (rgb) {
  return ((rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000) < 128
}

// Get whether the color is "light", useful for deciding text color.
var light = exports.light = function (rgb) {
  return !dark(rgb)
}