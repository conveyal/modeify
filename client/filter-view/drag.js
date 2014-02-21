/**
 * Dependencies
 */

var Emitter = require('emitter');
var evnt = require('event');

/**
 * Expose `draggable`
 */

module.exports = function(el) {
  var emitter = new Emitter();
  var origin = [0, 0];
  var start = [0, 0];

  var onMouseDown = function(e) {
    origin = [el.offsetLeft, el.offsetTop];
    start = [e.pageX, e.pageY];

    emitter.emit('dragstart', {
      el: el,
      origin: origin,
      start: start,
      current: start
    });

    var onMouseMove = function(e) {
      var left = origin[0] + (e.pageX - start[0]);
      if (left >= 0 && left <= el.parentNode.offsetWidth) el.style.left = left +
        'px';

      return emitter.emit('drag', {
        el: el,
        origin: origin,
        start: start,
        current: [e.pageX, e.pageY]
      });
    };

    var onMouseUp = function(e) {
      emitter.emit('dragstop', {
        el: el,
        origin: origin,
        start: start,
        current: [e.pageX, e.pageY]
      });

      evnt.unbind(document, 'mousemove', onMouseMove);
      evnt.unbind(document, 'mouseup', onMouseUp);
    };

    evnt.bind(document, 'mousemove', onMouseMove);
    evnt.bind(document, 'mouseup', onMouseUp);
  };

  evnt.bind(el, 'mousedown', onMouseDown);
  emitter.on('remove', function() {
    evnt.unbind(el, 'mousedown', onMouseDown);
  });

  return emitter;
};
