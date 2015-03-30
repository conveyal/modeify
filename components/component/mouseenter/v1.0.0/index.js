var events = require('event');

module.exports = mouseenter

/**
 * invoke fn {Function} on mouseenter event for el {Element}
 * @return {Function} unbind function
 */

function mouseenter(el, fn) {
  function listener(ev) {
    var related = ev.relatedTarget;
    if (!related || (related !== el && contains(el, related))) {
      fn.call(this, ev);
    }
  }

  events.bind(el, 'mouseover', listener);
  return function() {
    events.unbind(el, 'mouseover', listener);
  }
}

function contains(haystack, needle) {
  var targ = needle;
  while (targ && targ !== haystack) {
    targ = targ.parentNode;
  }
  return targ !== haystack;
}

