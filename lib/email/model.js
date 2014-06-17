var log = require('../log');
var mandrill = require('../mandrill');
var mongoose = require('../mongo');

/**
 * Expose `schema`
 */

var schema = module.exports = new mongoose.Schema({
  _campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  _commuter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commuter'
  },
  _organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  outdated: Boolean,
  metadata: Object,
  result: Object,
  events: Array
});

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-trackable'));

/**
 * Update from Mandrill
 */

schema.methods.syncWithMandrill = function(callback) {
  var email = this;
  if (email.outdated) return callback();

  mandrill.info(email.result._id, function(err, data) {
    if (err) {
      // Email does not exist in mandrill anymore
      if (err.code === 11) {
        email.outdated = true;
        email.save(callback);
      } else {
        callback(err);
      }
    } else {
      email.result = data;
      email.save(callback);
    }
  });
};

/**
 * Update commuter
 */

schema.methods.updateCommuter = function(commuter, callback) {
  if (arguments.length === 1) {
    callback = commuter;
    commuter = this._commuter;
  }

  // if commuter doesn't exist, just return
  if (!commuter) return callback();

  // latest event
  var event = this.latestEvent();

  // Default status
  commuter.status = 'sent';

  // has clicks or was a click event
  if (this.result.clicks > 0 || event.event === 'click') {
    commuter.status = 'clicked';
  } else if (this.result.opens > 0 || event.event === 'open') {
    commuter.status = 'opened';
  }

  commuter.save(callback);
};

/**
 * Get the latest event
 */

schema.methods.latestEvent = function() {
  return (this.events || []).slice(-1)[0] || {};
};

/**
 * Expose `Email`
 */

var Email = module.exports = mongoose.model('Email', schema);
