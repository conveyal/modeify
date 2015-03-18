var domify = require('domify');
var Emitter = require('emitter');
var overlay = require('overlay');
var onEscape = require('on-escape');
var template = require('./index.html');
var Showable = require('showable');
var Classes = require('classes');

/**
 * Expose `Modal`.
 */

module.exports = Modal;


/**
 * Initialize a new `Modal`.
 *
 * @param {Element} el The element to put into a modal
 */

function Modal (el) {
  if (!(this instanceof Modal)) return new Modal(el);
  this.el = domify(template);
  this.el.appendChild(el);
  this._overlay = overlay();

  var el = this.el;

  this.on('showing', function(){
    document.body.appendChild(el);
  });

  this.on('hide', function(){
    document.body.removeChild(el);
  });
}


/**
 * Mixin emitter.
 */

Emitter(Modal.prototype);
Showable(Modal.prototype);
Classes(Modal.prototype);


/**
 * Set the transition in/out effect
 *
 * @param {String} type
 *
 * @return {Modal}
 */

Modal.prototype.effect = function(type) {
  this.el.setAttribute('effect', type);
  return this;
};


/**
 * Add an overlay
 *
 * @param {Object} opts
 *
 * @return {Modal}
 */

Modal.prototype.overlay = function(){
  var self = this;
  this.on('showing', function(){
    self._overlay.show();
  });
  this.on('hiding', function(){
    self._overlay.hide();
  });
  return this;
};


/**
 * Make the modal closeable.
 *
 * @return {Modal}
 */

Modal.prototype.closeable =
Modal.prototype.closable = function () {
  var self = this;

  function hide(){
    self.hide();
  }

  this._overlay.on('click', hide);
  onEscape(hide);
  return this;
};