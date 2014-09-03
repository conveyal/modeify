var log = require('log')('modal');
var modal = require('modal');
var view = require('view');

/**
 * Expose `modal`
 */

module.exports = function(opts, fn) {
  var Modal = view(opts, fn);

  /**
   * Show Modal
   */

  Modal.prototype.show = function(fn) {
    log.info('showing modal');

    this.modal = modal(this.el).overlay();

    if (opts.width) this.modal.el.style['max-width'] = opts.width;
    if (opts.closable) this.modal.closable();

    var el = this.modal.el;
    this.modal.show(function() {

      setTimeout(function() {
        var height = el.clientHeight;
        var offset = el.offsetTop;
        var windowHeight = window.innerHeight;

        if ((height + offset) > windowHeight)
          el.style.height = (windowHeight - offset) + 'px';
      }, 0);

      if (fn) fn();
    });
  };

  /**
   * Hide Modal
   */

  Modal.prototype.hide = function(e) {
    log.info('hiding modal');

    if (e) e.preventDefault();
    if (this.modal) this.modal.hide();
  };

  return Modal;
};
