/**
 * Dependencies
 */

var map = require('map');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'));

/**
 * On construct
 */

View.on('construct', function(view) {
  view.on('rendered', function() {
    var m = map(view.find('.map'), {
      center: {
        lat: 38.904862,
        lng: -77.034569
      },
      zoom: 11
    });
  });
});
