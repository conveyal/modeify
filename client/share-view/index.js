var modal = require('./client/modal')


/**
 * Expose `Modal`
 */

var Modal = module.exports = modal({
  closable: true,
  width: '768px',
  template: require('./template.html')
}, function (view, routes) {})