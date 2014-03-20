/**
 * Dependencies
 */

var async = require('async');
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
 * Process Mandrill events coming in from a webhook
 */

schema.methods.processEvents = function(events, callback) {
  var Email = this;
  async.each(events, function(evnt, done) {
    log.info('mandrill event', evnt);

    Email
      .findOne()
      .where('result._id', evnt._id)
      .populate('_commuter')
      .exec(function(err, email) {
        if (err || !email) {
          done(err);
        } else {
          email.events = email.events || [];
          email.events.push(evnt);
          email.save(function(err) {
            if (err) {
              done(err);
            } else {
              email.updateCommuter(done);
            }
          });
        }
      });
  }, callback);
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
  var event = (this.events || []).slice(-1)[0] || {};

  // has clicks or was a click event
  if (this.result.clicks > 0 || event.event === 'click') {
    commuter.status = 'clicked';
  } else if (this.result.opens > 0 || event.event === 'open') {
    commuter.status = 'opened';
  } else {
    commuter.status = 'sent';
  }

  commuter.save(callback);
};

/**
 * Expose `Email`
 */

var Email = module.exports = mongoose.model('Email', schema);
