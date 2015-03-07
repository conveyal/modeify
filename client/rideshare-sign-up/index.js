var config = require('config');
var debug = require('debug')(config.name() + ':rideshare-sign-up');

var modal = require('modal');

var LocationsView = require('locations-view');

var SignUpModal = module.exports = modal({
  closable: true,
  template: require('./template.html'),
  title: 'Sign Up Modal'
});

SignUpModal.prototype.save = function(e) {
  debug('submit');
};

SignUpModal.prototype.locationsView = function() {
  return new LocationsView(this.options.plan);
};
