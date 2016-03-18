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

  console.log("e.category", e.category);
  console.log("e.action", e.action;
  console.log("e.label", e.label);
  console.log("e.value", e.value);

  if (!ignore && config.ga_key && config.ga_key()) {
    ga('send', 'event', e.category, e.action, e.label, e.value);
  }
};

module.exports.send_ac = function (e) {
  var url, changeset,
    ignore = location.host.indexOf(config.ignore_events_from()) !== -1; 

  if (!ignore && config.ac_key && config.ac_key()) {
    url = config.ac_event_url() + 
      '?token=' + config.ac_key();

    changeset = {
      parent: null,
      entity: config.ac_event_table(), 
      type: 'DML',
      action: 'INSERT',
      data: [{
	amigo_id: null,
	new: e
      }]
    };
    $.post(
      url,
      $.param({change: JSON.stringify(changeset)})
    );
  }
  console.log("config.ac_event_table()", config.ac_event_table());
  console.log("url->", url);
  console.log("changeset->", changeset);
};
