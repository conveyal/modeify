/**
 * Dependencies
 */

var d3 = require('d3');
var draggable = require('./drag');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'));

/**
 * On construct
 */

View.on('construct', function(view) {
  view.reactive.bind('on-drag', function(el, name) {
    var drag = draggable(el);
    var cb = function(opts) {
      view[name](opts.el);
      view.setWidth();
    };

    drag.on('dragstart', cb);
    drag.on('drag', cb);
    drag.on('dragend', function(opts) {
      var time = elToTime(opts.el);

      view.setTime(el, time);
      view.setWidth();
      view.model.set(name, time);

      drag.emit('remove');
    });
  });

  view.reactive.bind('data-mode', function(el, name) {
    this.change(function() {
      var val = this.value(name);
      if (val) el.classList.add('active');
      else el.classList.remove('active');
    });
  });

  view.on('rendered', function() {
    view.setTime(view.find('.handle.left'), view.model.start());
    view.setTime(view.find('.handle.right'), view.model.end());
    view.setWidth();
  });
});

/**
 * Set Active
 */

View.prototype.setActive = function(e) {
  console.log(e);

};

/**
 * Set Left
 */

View.prototype.setTime = function(el, time) {
  el.style.left = toPixels(el.parentNode.offsetWidth, time) + 'px';
  el.innerText = time;
};

/**
 * Update Start
 */

View.prototype.start = function(el) {
  var end = this.model.end();
  var start = this.model.start();
  var time = elToTime(el);

  if (time >= end) {
    if (time === 12) return this.setTime(this.find('.handle.left'), 11);
    this.setTime(this.find('.handle.right'), time + 1);
    this.model.end(time + 1);
  }

  if (start !== time) {
    el.innerText = time;
  }
};

/**
 * Update End
 */

View.prototype.end = function(el) {
  var end = this.model.end();
  var start = this.model.start();
  var time = elToTime(el);

  if (time <= start) {
    if (time === 0) return this.setTime(this.find('.handle.left'), 1);
    this.setTime(this.find('.handle.right'), time - 1);
  }

  if (end !== time) {
    el.innerText = time;
  }
};

/**
 * Width
 */

View.prototype.setWidth = function() {
  var bar = this.find('.progress-bar.main');
  var left = this.find('.handle.left').offsetLeft;
  var right = this.find('.handle.right').offsetLeft;

  bar.style.left = left + 'px';
  bar.style.width = (right - left) + 'px';
};

/**
 * Element to time scale
 */

function elToTime(el) {
  return toTime(el.parentNode.offsetWidth, el.offsetLeft);
}

function toTime(width, pixels) {
  return d3.scale.linear()
    .domain([ 0, width ])
    .rangeRound([ 0, 12 ])(pixels);
}

function toPixels(width, time) {
  return d3.scale.linear()
    .domain([ 0, 12 ])
    .range([ 0, width ])(time);
}
