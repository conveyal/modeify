var toCapitalCase = require('to-capital-case');

/**
 * Expose `formatOption`
 */

module.exports.option = formatOption;

/**
 * Format Journey
 */

module.exports.journey = function(journey) {
  var i;

  for (i = 0; i < journey.routes.length; i++) {
    var r = journey.routes[i];
    r.route_long_name = format(r.route_long_name);
    r.route_short_name = format(r.route_short_name) || r.route_long_name;
  }

  for (i = 0; i < journey.stops.length; i++) {
    var s = journey.stops[i];
    s.stop_name = format(s.stop_name) || '';
  }

  return journey;
};

/**
 * Format a given option summary and it's segments
 */

function formatOption(o) {
  if (o.access) {
    o.access.forEach(function(a) {
      if (a.walkSteps) {
        a.walkSteps.forEach(function(w) {
          w.streetName = format(w.streetName);
        });
      }

      if (a.streetEdges) {
        a.streetEdges.forEach(function(se) {
          se.streetName = format(se.streetName);
        });
      }
    });
  }

  if (o.transit) {
    for (var i = 0; i < o.transit.length; i++) {
      var segment = o.transit[i];

      segment.fromName = format(segment.fromName);
      segment.toName = format(segment.toName);
      segment.longName = format(segment.longName);
      segment.shortName = format(segment.shortName);
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
    .replace('METRORAIL STATION', '')
    .replace('(MAIN)', '')
    .replace(/-/g, ' '); // remove hypens

  // capitalize
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
  'Bwi': 'BWI',
  'Ci': 'Circle',
  'Lh': 'LH',
  'Marc': 'MARC',
  'Mcpherson': 'McPherson',
  'Pi': 'Pike',
  'Sq': 'Square',
  'Md': 'MD',
  'Nw': 'NW',
  'Ne': 'NE',
  'Nih': 'NIH',
  'Se': 'SE',
  'Sw': 'SW',
  'Metro/naval': 'Metro/Naval',
  'Noma': 'NoMa',
  'Noma-gallaudet': 'NoMa-Gallaudet',
  'Park/u': 'Park/U',
  '(new': '(New',
  'L\'enfant': 'L\'Enfant',
  '(west)': '(West)',
  '=>': 'to'
};

/**
 * Word replacement
 */

function word(w) {
  if (startsWithDigit(w)) return w.toUpperCase();
  if (wordReplacementTable.hasOwnProperty(w)) return wordReplacementTable[w];
  return w;
}

function startsWithDigit(s) {
  return /^[0-9]/.test(s) && !/st|nd|rd|th$/i;
}
