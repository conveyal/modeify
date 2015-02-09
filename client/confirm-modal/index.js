var modal = require('./client/modal');

/**
 * Create `Modal`
 */

var Modal = modal({
  closable: true,
  template: require('./template.html')
});

/**
 * Confirm
 */

Modal.prototype.confirm = function(e) {
  e.preventDefault();
  this.model.confirmCallback.apply(this, e);
  this.hide();
};

/**
 * Expose `confirm`
 */

module.exports = function(opts, callback) {
  var m = Modal({
    confirmCallback: callback,
    confirmText: opts.confirmText || 'Ok',
    text: opts.text
  });

  m.show();

  return m;
};
