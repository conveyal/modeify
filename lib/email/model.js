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
  mandrill.info(email.result._id, function(err, data) {
    if (err) return callback(err);
    email.result = data;
    email.save(callback);
  });
};

/**
 * Process Mandrill events coming in from a webhook
 */

schema.methods.processEvents = function(events, callback) {
  var Email = this;
  async.each(events, function(evnt, done) {
    log.info('mandrill event', evnt);

    Email.findOne({ 'result._id': evnt._id }, function(err, email) {
      if (err) return done(err);
      else if (!email) return done();

      email.events = email.events || [];
      email.events.push(evnt);
      email.save(done);
    });
  }, callback);
};

/**
 * Expose `Email`
 */

var Email = module.exports = mongoose.model('Email', schema);
