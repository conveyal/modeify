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

    drag.on('drag', function(opts) {
      view[name](opts.el);
      view.setRange();
    });

    drag.on('dragend', function() {
      view.saveTime();
      drag.emit('remove');
    });
  });

  view.displayAMPM(view.model.am_pm());
  view.model.on('change am_pm', view.displayAMPM.bind(view));

  view.on('rendered', function() {
    view.reactive.bind('data-style-left', function(el, name) {
      this.change(function() {
        var val = this.value(name);
        el.style.left = toPixels(el.parentNode.offsetWidth, val) + 'px';
        el.innerText = val;
      });
    });

    view.setRange();
  });
});

/**
 * Set Day of the Week
 */

View.prototype.setDays = function(e) {
  e.preventDefault();
  this.model.days(e.target.dataset.value);
};

/**
 * Set AMPM
 */

View.prototype.setAMPM = function(e) {
  var ampm = e.target.classList.contains('am') ? 'am' : 'pm';

  this.model.am_pm(ampm);
  document.activeElement.blur();
};

/**
 * Display AM/PM
 */

View.prototype.displayAMPM = function(ampm) {
  var am = this.find('.am');
  var pm = this.find('.pm');
  if (ampm === 'am') {
    am.classList.add('active');
    pm.classList.remove('active');
  } else {
    pm.classList.add('active');
    am.classList.remove('active');
  }
};

/**
 * Save
 */

View.prototype.saveTime = function() {
  this.model.set({
    start_time: elToTime(this.find('.handle.start-time')),
    end_time: elToTime(this.find('.handle.end-time'))
  });
};

/**
 * Set Left
 */

View.prototype.setTime = function(el, time) {
  el.style.left = toPixels(el.parentNode.offsetWidth, time) + 'px';
  el.innerText = time;
};

/**
 * Set time position
 */

View.prototype.setTimePositions = function(el) {
  var time = elToTime(el);

  if (el.classList.contains('start-time')) {
    var endEl = this.find('.handle.end-time');
    if (time >= elToTime(endEl)) {
      if (time === 12) return this.setTime(el, 11);
      this.setTime(endEl, time + 1);
    }
  } else {
    var startEl = this.find('.handle.start-time');
    if (time <= elToTime(startEl)) {
      if (time === 0) return this.setTime(el, 1);
      this.setTime(startEl, time - 1);
    }
  }

  el.innerText = time;
};

/**
 * Width
 */

View.prototype.setRange = function() {
  var range = this.find('.progress-bar.range');
  var left = this.find('.handle.start-time').offsetLeft;
  var right = this.find('.handle.end-time').offsetLeft;

  range.style.left = left + 'px';
  range.style.width = (right - left) + 'px';
};

/**
 * Element to time scale
 */

function elToTime(el) {
  return toTime(el.parentNode.offsetWidth, el.offsetLeft);
}

/**
 * To time
 */

function toTime(width, pixels) {
  return d3.scale.linear()
    .domain([0, width])
    .rangeRound([0, 12])(pixels);
}

/**
 * To Pixels
 */

function toPixels(width, time) {
  return d3.scale.linear()
    .domain([0, 12])
    .range([0, width])(time);
}
