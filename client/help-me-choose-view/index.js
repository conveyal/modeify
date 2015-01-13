var hogan = require('hogan.js');
var modal = require('modal');
var routeSummarySegments = require('route-summary-segments');

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

/**
 * Refresh
 */

Modal.prototype.refresh = function(e) {
  e && e.preventDefault();

};

/**
 * Append option
 */

Modal.prototype.renderOption = function(option) {
  return optionTemplate.render({
    segments: routeSummarySegments(option),

  });
};
