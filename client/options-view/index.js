/**
 * Dependencies
 */

var otp = require('otp');
var view = require('view');

/**
 * Expose `Options`
 */

var Options = module.exports = view(require('./template.html'), function(options) {
  options['routes-view'] = view(require('./route.html'));

  options.model.on('change from', update);
  options.model.on('change to', update);

  function update() {
    otp.profile(options.model.from(), options.model.to(), function(err, data) {
      if (err) {
        window.error(err);
      } else {
        console.log(data);
        options.model.routes(data);
      }
    });
  }
});
