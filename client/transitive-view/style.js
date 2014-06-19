var parse = require('color-parser');

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

exports.labels = {
  'font-family': '\'Open Sans\', sans-serif',
  'z-index': 1000
};

exports.stops_merged = {
  width: 10,
  height: 10
};
