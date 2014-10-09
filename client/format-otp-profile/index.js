var toCapitalCase = require('to-capital-case');

/**
 * Expose `formatOptions`
 */

module.exports.option = formatOption;

/**
 * Format Journey
 */

module.exports.journey = function(journey) {
  var i;
  for (i = 0; i < journey.routes.length; i++) {
    var r = journey.routes[i];
    r.short_name = format(r.short_name);
    r.long_name = format(r.long_name);
  }

  for (i = 0; i < journey.stops.length; i++) {
    var s = journey.stops[i];
    s.stop_name = format(s.stop_name);
  }

  return journey;
};

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
    .replace('METRORAIL STATION', '')
    .replace('(MAIN)', '')
  .replace(/-/g, ' '); // remove hypens

  // capitalize correctly
  text = toCapitalCase(text);

  // process individual words
  text = text
    .split(' ')
    .map(word)
    .join(' ')
    .trim();

  return text;
}

/**
 * Words that get replaced
 */

var wordReplacementTable = {
  'Av': 'Ave',
  'Ci': 'Circle',
  'Mcpherson': 'McPherson',
  'Pi': 'Pike',
  'Sq': 'Square',
  'Md': 'MD',
  'Nw': 'NW',
  'Northwest': 'NW',
  'Ne': 'NE',
  'Nih': 'NIH',
  'Northeast': 'NE',
  'South': 'S',
  'Se': 'SE',
  'Southeast': 'SE',
  'Sw': 'SW',
  'Southwest': 'SW',
  'Metro/naval': 'Metro/Naval',
  'Noma': 'NoMA',
  'Noma-gallaudet': 'NoMA-Gallaudet',
  'Park/u': 'Park/U',
  '(new': '(New',
  'L\'enfant': 'L\'Enfant',
  '(west)': '(West)'
};

/**
 * Word replacement
 */

function word(w) {
  return wordReplacementTable.hasOwnProperty(w) ? wordReplacementTable[w] : w;
}
