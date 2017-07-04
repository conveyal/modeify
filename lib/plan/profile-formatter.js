/**
 * Expose `formatOption`
 */

module.exports.option = formatOption

/**
 * Format Journey
 */

module.exports.journey = function (journey) {
  var i

  for (i = 0; i < journey.routes.length; i++) {
    var r = journey.routes[i]
    r.route_long_name = format(r.route_long_name)
    r.route_short_name = format(r.route_short_name) || format(r.route_long_name)
  }

  for (i = 0; i < journey.stops.length; i++) {
    var s = journey.stops[i]
    s.stop_name = format(s.stop_name) || ''
  }

  return journey
}

/**
 * Format a given option summary and it's segments
 */

function formatOption (o) {
  if (o.access) {
    o.access = o.access.map(formatAccessEgress)
  }

  if (o.transit) {
    for (var i = 0; i < o.transit.length; i++) {
      var segment = o.transit[i]

      segment.fromName = format(segment.fromName)
      segment.toName = format(segment.toName)
      segment.longName = format(segment.longName)
      segment.shortName = format(segment.shortName)
    }
  }

  if (o.egress) {
    o.egress = o.egress.map(formatAccessEgress)
  }

  return o
}

function formatAccessEgress (ae) {
  if (ae.streetEdges) {
    ae.streetEdges = ae.streetEdges.map(function (se) {
      se.streetName = format(se.streetName)
      return se
    })
  }

  return ae
}

/**
 * Format text
 */

function format (text) {
  if (!text) return

  text = text
    .replace('METRO STATION', '') // remove metro station
    .replace('METRORAIL STATION', '')
    .replace('(MAIN)', '')
    .replace(/-/g, ' ') // remove hypens

  // capitalize
  text = toCapitalCase(text)

  // process individual words
  text = text
    .split(' ')
    .map(word)
    .join(' ')
    .trim()

  return text
}

/**
 * Words that get replaced
 */

var wordReplacementTable = {
  '@': 'at',
  'Av': 'Ave',
  'Bwi': 'BWI',
  'Ci': 'Circle',
  'Gmu': 'GMU',
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
  "L'enfant": "L'Enfant",
  '(west)': '(West)',
  '=>': 'to',
  'Northwest': 'NW',
  'Northeast': 'NE',
  'Southwest': 'SW',
  'Southeast': 'SE',
  'Street': 'St',
  'Uturn': 'U-Turn',
  'Vienna/gmu': 'Vienna/GMU'
}

/**
 * Word replacement
 */

function word (w) {
  if (startsWithDigit(w)) return w.toUpperCase()
  if (wordReplacementTable.hasOwnProperty(w)) return wordReplacementTable[w]
  return w
}

function startsWithDigit (s) {
  return /^[0-9]/.test(s) && !/st|nd|rd|th$/i
}

/**
 * Met la première lettre en majuscule
 */

function toCapitalCase (string) {
  return string.replace(/(^|\s)(\w)/g, function (matches, previous, letter) {
    return previous + letter.toUpperCase();
  });
}
