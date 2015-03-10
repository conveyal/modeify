var LocationsView = require('locations-view');
var log = require('log')('rideshare-sign-up');
var modal = require('modal');

var ThanksModal = module.exports = modal({
  closable: true,
  template: require('./thanks.html'),
  title: 'Thanks Modal'
});

var SignUpModal = module.exports = modal({
  closable: true,
  template: require('./template.html'),
  title: 'Sign Up Modal'
});

SignUpModal.prototype.save = function(e) {
  log('submit');
  ThanksModal().show();
};

SignUpModal.prototype.locationsView = function() {
  return new LocationsView(this.options.plan);
};
