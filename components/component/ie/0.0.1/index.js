/**
 * Export `ie`.
 */

module.exports = ie();

/**
 * Initialize `ie`
 *
 * @return {Number|undefined}
 * @api public
 */

function ie() {
  for( var v = 3,
           el = document.createElement('b'),
           // empty array as loop breaker (and exception-avoider) for non-IE and IE10+
           all = el.all || [];
       // i tag not well-formed since we know that IE5-IE9 won't mind
       el.innerHTML = '<!--[if gt IE ' + (++v) + ']><i><![endif]-->',
       all[0];
     );
  // return the documentMode for IE10+ compatibility
  // non-IE will get undefined
  return v > 4 ? v : document.documentMode;
}
