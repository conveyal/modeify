/**
 * Check if `el` or browser supports transitions.
 *
 * @param {Element} el
 * @return {Boolean}
 * @api public
 */

exports = module.exports = function(el){
  switch (arguments.length) {
    case 0: return bool;
    case 1: return bool
      ? transitions(el)
      : bool;
  }
};

/**
 * Check if the given `el` has transitions.
 *
 * @param {Element} el
 * @return {Boolean}
 * @api private
 */

function transitions(el, styl){
  if (el.transition) return true;
  styl = window.getComputedStyle(el);
  return !! parseFloat(styl.transitionDuration, 10);
}

/**
 * Style.
 */

var styl = document.body.style;

/**
 * Export support.
 */

var bool = 'transition' in styl
  || 'webkitTransition' in styl
  || 'MozTransition' in styl
  || 'msTransition' in styl;
