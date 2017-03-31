var domify = require('domify');
var Emitter = require('component-emitter');
var overlay = require('../../../overlay/0.2.4/lib');
var onEscape = require('../../../on-escape/0.0.3');
var Showable = require('../../../showable/0.1.2');
var Classes = require('../../../../ianstormtaylor/classes/0.1.0');

var template = require('./index.html');

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