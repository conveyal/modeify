var config = require('./client/config');
var tableize = require('tableize');

module.exports.identify = function(id, data) {
  if (config.segmentio_key())
    window.analytics.identify(id, tableize(data || {}));
};

module.exports.page = function(name, category) {
  if (config.segmentio_key())
    window.analytics.page(name, category);
};

module.exports.track = function(name, data) {
  if (config.segmentio_key())
    window.analytics.track(name, tableize(data || {}));
};

module.exports.send_ga = function (e) {
  var ignore = location.host.indexOf(config.ignore_events_from()) !== -1;
  if (!ignore && config.ga_key && config.ga_key()) {
    ga('send', 'event', e.category, e.action, e.label, e.value);
  }
};
