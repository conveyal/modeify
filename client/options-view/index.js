/**
 * Dependencies
 */

var otp = require('otp');
var view = require('view');

/**
 * Expose `Options`
 */

var Options = module.exports = view(require('./template.html'), function(
  options) {
  options['routes-view'] = view(require('./route.html'));

  options.model.on('change from_ll', update);
  options.model.on('change to_ll', update);

  function update() {
    var from = options.model.from_ll();
    var to = options.model.to_ll();

    if (from && to && from.lat && from.lng && to.lat && to.lng) {
      otp.profile(from, to, function(err, data) {
        if (err) {
          window.alert(err);
        } else {
          console.log(data);
          options.model.routes(data);
        }
      });
    }
  }
});
