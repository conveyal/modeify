
/**
 * The `font-variant-ligatures` property.
 */

exports['font-variant-ligatures'] = {
  'common-ligatures'           : '"liga", "clig"',
  'no-common-ligatures'        : '"liga", "clig off"',
  'discretionary-ligatures'    : '"dlig"',
  'no-discretionary-ligatures' : '"dlig" off',
  'historical-ligatures'       : '"hlig"',
  'no-historical-ligatures'    : '"hlig" off',
  'contextual'                 : '"calt"',
  'no-contextual'              : '"calt" off'
};

/**
 * The `font-variant-position` property.
 */

exports['font-variant-position'] = {
  'sub'   : '"subs"',
  'super' : '"sups"'
};

/**
 * The `font-variant-caps` property.
 */

exports['font-variant-caps'] = {
  'small-caps'      : '"c2sc"',
  'all-small-caps'  : '"smcp", "c2sc"',
  'petite-caps'     : '"pcap"',
  'all-petite-caps' : '"pcap", "c2pc"',
  'unicase'         : '"unic"',
  'titling-caps'    : '"titl"'
};

/**
 * The `font-variant-numeric` property.
 */

exports['font-variant-numeric'] = {
  'lining-nums'        : '"lnum"',
  'oldstyle-nums'      : '"onum"',
  'proportional-nums'  : '"pnum"',
  'tabular-nums'       : '"tnum"',
  'diagonal-fractions' : '"frac"',
  'stacked-fractions'  : '"afrc"',
  'ordinal'            : '"ordn"',
  'slashed-zero'       : '"zero"'
};


/**
 * The `font-variant` property is a shorthand for all the others.
 */

exports['font-variant'] = {
  'normal'  : 'normal',
  'inherit' : 'inherit'
};

for (var prop in exports) {
  var keys = exports[prop];
  for (var key in keys) {
    exports['font-variant'][key] = keys[key];
  }
}
