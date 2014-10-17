var config = require('config');
var log = require('log')('welcome-flow:finding-options');
var modal = require('modal');

/**
 * Create `Modal`
 */

var FindingOptions = module.exports = modal({
  category: 'planner-welcome-flow',
  template: require('./template.html'),
  title: 'Finding Options Modal'
});

FindingOptions.prototype.next = function(e) {
  e.preventDefault();
  this.emit('next');
};

FindingOptions.prototype.email = function() {
  return config.email().address;
};