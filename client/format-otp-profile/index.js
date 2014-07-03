
var toCapitalCase = require('to-capital-case');

/**
 * Metro Colors
 */

var colors = ['Blue', 'Green', 'Orange', 'Red', 'Yellow'];

/**
 * Expose `formatOptions`
 */

module.exports = formatOptions;

/**
 * Format a list of options
 */

function formatOptions(opts) {
  for (var i = 0; i < opts.length; i++) opts[i] = formatOption(opts[i]);

  return opts;
}

/**
 * Format a given option summary and it's segments
 */

function formatOption(o) {
  // Format the summary
  o.summary = format(o.summary);

  // If there are no segments to format, return
  if (!o.segments) return o;
  for (var i = 0; i < o.segments.length; i++) {
    var segment = o.segments[i];

    segment.fromName = format(segment.fromName);
    segment.routeShortName = format(segment.routeShortName);
    segment.toName = format(segment.toName);

    switch (segment.mode) {
      case 'BUS':

        break;
      case 'SUBWAY':

        break;
    }
  }

  return o;
}

/**
 * Format text
 */

function format(text) {
  if (!text) return;

  text = text
    .replace('METRO STATION', '') // remove metro station
    .replace(/-/g, ' '); // remove hypens

  // capitalize correctly
  text = toCapitalCase(text);

  // replace 'Dc*' with 'DC*'
  text = text.replace('Dc', 'DC');

  // process individual words
  return text
    .split(' ')
    .map(word)
    .join(' ');
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