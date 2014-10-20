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
}, function(view) {
  view.on('showing', function() {
    view.loadOptions();
  });
});

FindingOptions.prototype.next = function(e) {
  e.preventDefault();
  this.emit('next');
};

FindingOptions.prototype.email = function() {
  return config.email().address;
};

FindingOptions.prototype.loadOptions = function() {
  var button = this.find('.btn');
  var loading = this.find('.loading-text');
  var showText = this.find('.show-text');
  var plan = this.model;

  plan.updateRoutes({}, function() {
    loading.remove();
    showText.classList.remove('hidden');
    button.classList.remove('disabled');
    plan.saveJourney();
  });
};
