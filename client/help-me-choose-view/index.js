var hogan = require('hogan.js');
var modal = require('modal');

var optionTemplate = hogan.compile(require('./option.html'));

/**
 * Expose `Modal`
 */

var Modal = module.exports = modal({
  closable: true,
  width: '640px',
  template: require('./template.html')
}, function(view) {

});
