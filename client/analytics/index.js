var log = require('log')('analytics');
var tableize = require('tableize');

module.exports.identify = function (id, data) {
  window.analytics.identify(id, tableize(data));
};

module.exports.page = function (name, category) {
  window.analytics.page(name, category);
};

module.exports.track = function (name, data) {
  window.analytics.track(name, tableize(data));
};