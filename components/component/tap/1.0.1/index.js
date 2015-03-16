/**
 * Module Dependencies
 */

var event = require('event'),
    bind = require('bind');

/**
 * Expose `Tap`
 */

module.exports = Tap;

/**
 * Touch support
 */

var support = 'ontouchstart' in window;

/**
 * Tap on `el` to trigger a `fn`
 *
 * Tap will not fire if you move your finger
 * to scroll
 *
 * @param {Element} el
 * @param {Function} fn
 */

function Tap(el, fn) {
  if(!(this instanceof Tap)) return new Tap(el, fn);
  this.el = el;
  this.fn = fn || function() {};
  this.tap = true;

  if (support) {
    this.ontouchmove = bind(this, this.touchmove);
    this.ontouchend = bind(this, this.touchend);
    event.bind(el, 'touchmove', this.ontouchmove);
    event.bind(el, 'touchend', this.ontouchend);
  } else {
    event.bind(el, 'click', this.fn);
  }
}

/**
 * Touch end
 *
 * @param {Event} e
 * @return {Tap}
 * @api private
 */

Tap.prototype.touchend = function(e) {
  if (this.tap) this.fn(e);
  this.tap = true;
  event.bind(this.el, 'touchmove', this.ontouchmove);
  return this;
};

/**
 * Touch move
 *
 * @return {Tap}
 * @api private
 */

Tap.prototype.touchmove = function() {
  this.tap = false;
  event.unbind(this.el, 'touchmove', this.ontouchmove);
  return this;
};

/**
 * Unbind the tap
 *
 * @return {Tap}
 * @api public
 */

Tap.prototype.unbind = function() {
  event.unbind(this.el, 'touchend', this.ontouchend);
  event.unbind(this.el, 'click', this.fn);
  return this;
};
