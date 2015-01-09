var modal = require('modal');

/**
 * Expose `Modal`
 */

var Modal = module.exports = modal({
  closable: true,
  width: '640px',
  template: require('./template.html')
});
