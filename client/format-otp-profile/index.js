var toCapitalCase = require('to-capital-case');

/**
 * Expose `formatOptions`
 */

module.exports = formatOption;

/**
 * Format a given option summary and it's segments
 */

function formatOption(o) {
  // If there are no segments to format, return
  if (!o.transit) return o;
  for (var i = 0; i < o.transit.length; i++) {
    var segment = o.transit[i];

    segment.fromName = format(segment.fromName);
    segment.toName = format(segment.toName);
    segment.longName = format(segment.longName);
    segment.shortName = format(segment.shortName);
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
  'Noma-gallaudet': 'NoMA-Gallaudet',
  '(new': '(New'
};

/**
 * Word replacement
 */

function word(w) {
  return wordReplacementTable.hasOwnProperty(w) ? wordReplacementTable[w] : w;
}
