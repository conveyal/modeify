var log = require('log')('welcome-flow');
var Welcome = require('./welcome');

/**
 * Show Modal
 */

module.exports = function(session) {
  var commuter = session.commuter();
  var welcome = new Welcome(commuter);
  welcome.show();

  welcome.on('next', function() {
    commuter.updateProfile('welcome_wizard_complete', true);
    welcome.hide();
  });
};
