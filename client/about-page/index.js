var modal = require('modal');
var TermsAndConditions = require('terms-and-conditions-modal');

/**
 * Create `Modal`
 */

var Modal = module.exports = modal({
  closable: true,
  width: '640px',
  template: require('./template.html')
});

/**
 * Show terms and conditions
 */

Modal.prototype.termsAndConditions = function() {
  var t = new TermsAndConditions();
  t.show();
};
