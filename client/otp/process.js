
var score = require('./score');
var toCapitalCase = require('to-capital-case');

/**
 * Metro Colors
 */

var colors = ['Blue', 'Green', 'Orange', 'Red', 'Yellow'];

/**
 * Expose `process`
 */

module.exports = process;

/**
 * Post process profile data
 */

function process(data) {
  var options = data.options;
  var numOptions = data.options.length;

  for (var i = 0; i < numOptions; i++) {
    var option = options[i];

    // Score the option
    score(option);

    // Add an id and format the summary
    option.id = 'option_' + i;
    option.summary = format(option.summary);

    if (!option.segments) continue;

    for (var j = 0; j < option.segments.length; j++) {
      var segment = option.segments[j];

      segment.type = colors.indexOf(segment.routeShortName) === -1 ? 'bus' :
        'train';

      segment.fromName = format(segment.fromName);
      segment.routeShortName = format(segment.routeShortName);
      segment.toName = format(segment.toName);
    }
  }

  data.options.sort(function(a, b) {
    return a.score - b.score;
  });

  return data;
}

/**
 * Format text
 */

function format(text) {
  if (!text) return;

  // remove metro station
  text = text.replace('METRO STATION', '');

  // remove hypens
  text = text.replace(/-/g, ' ');

  // capitalize correctly
  text = toCapitalCase(text);

  // replace 'Dc*' with 'DC*'
  text = text.replace('Dc', 'DC');

  // process individual words
  return text.split(' ').map(word).join(' ');
}

/**
 * Words that get replaced
 */

var wordReplacementTable = {
  'Mcpherson': 'McPherson',
  'Pi': 'Pike',
  'Sq': 'Square',
  'North': 'N',
  'Nw': 'NW',
  'Northwest': 'NW',
  'Ne': 'NE',
  'Northeast': 'NE',
  'South': 'S',
  'Se': 'SE',
  'Southeast': 'SE',
  'Sw': 'SW',
  'Southwest': 'SW',
  'Noma': 'NoMA',
  '(new': '(New'
};

/**
 * Word replacement
 */

function word(w) {
  return wordReplacementTable.hasOwnProperty(w) ? wordReplacementTable[w] : w;
}
