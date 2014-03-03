/**
 * Dependencies
 */

var async = require('async');
var Commuter = require('../commuter/model');
var mongoose = require('mongoose');

/**
 * Create `schema`
 */

var schema = new mongoose.Schema({
  _organization: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  status: {
    default: 'created',
    type: String,
    enum: ['created', 'sending', 'completed', 'failed']
  },
  completed: Date,
  filters: Array
});

/**
 * Set completed
 */

schema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed')
    this.completed = new Date();
  next();
});

/**
 * Send
 */

schema.methods.send = function(callback) {
  if (this.status !== 'created') return callback(new Error('Campaign cannot be sent twice.'));
  var campaign = this;
  Commuter
    .find()
    .where('_organization', campaign._organization)
    .populate('_organization')
    .populate('_user')
    .exec(function(err, commuters) {
      if (err) {
        callback(err);
      } else {
        async.each(commuters, function(commuter, done) {
          commuter.sendPlan(campaign._id, done);
        }, function(err) {
          if (err) {
            callback(err);
          } else {
            campaign.status = 'completed';
            campaign.save(callback);
          }
        });
      }
    });
};

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-trackable'));

/**
 * Expose `Campaign`
 */

var Campaign = module.exports = mongoose.model('Campaign', schema);
