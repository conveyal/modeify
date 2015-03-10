var Alert = require('./client/alert');
var LocationsView = require('locations-view');
var log = require('log')('rideshare-sign-up');
var modal = require('modal');
var request = require('./client/request');
var session = require('session');

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
  e.preventDefault();
  log('submit');

  var alerts = this.find('.alerts');
  var email = this.find('input[name=email]').value;
  var name = {
    first: this.find('input[name=first-name]').value,
    last: this.find('input[name=last-name]').value
  };
  var plan = session.plan();
  var commute = {
    origin: {
      address: plan.from(),
      coords: plan.from_ll()
    },
    destination: {
      address: plan.to(),
      coords: plan.to_ll()
    }
  };

  var button = this.find('button');
  var id = session.commuter()._id();

  button.disabled = true;
  request.post('/commuters/' + id + '/rideshare-sign-up', {
    email: email,
    name: name,
    commute: commute
  }, function(err, res) {
    if (err) {
      log.warn('%e %s', err);
      alerts.appendChild(Alert({
        type: 'warning',
        text: 'Failed to sign up. ' + res.text
      }).el);
      button.disabled = false;
    } else {
      ThanksModal().show();
    }
  });
};

SignUpModal.prototype.locationsView = function() {
  return new LocationsView(session.plan());
};
