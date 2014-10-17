var log = require('log')('welcome-flow:introduction');
var modal = require('modal');

/**
 * Create `Modal`
 */

var Introduction = module.exports = modal({
  category: 'planner-welcome',
  template: require('./template.html'),
  title: 'Introduction Modal'
});

Introduction.prototype.next = function(e) {
  e.preventDefault();
  this.emit('next');
};
