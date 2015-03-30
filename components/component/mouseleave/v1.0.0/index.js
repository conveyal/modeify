var events = require('event');

module.exports = mouseleave

/**
 * invoke fn {Function} on mouseleave event for el {Element}
 * @return {Function} unbind function
 */

function mouseleave(el, fn) {
  function listener(ev) {
    var related = ev.relatedTarget;
    if (!related || (related !== el && contains(el, related))) {
      fn.call(this, ev);
    }
  }

  events.bind(el, 'mouseout', listener);
  return function() {
    events.unbind(el, 'mouseout', listener);
  }
}

function contains(haystack, needle) {
  var targ = needle;
  while (targ && targ !== haystack) {
    targ = targ.parentNode;
  }
  return targ !== haystack;
}
