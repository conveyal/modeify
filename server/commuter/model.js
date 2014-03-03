/**
 * Dependencies
 */

var config = require('../../config.json')[process.env.NODE_ENV];
var Email = require('../email/model');
var mandrill = require('../mandrill');
var mongoose = require('mongoose');
var uuid = require('node-uuid');

/**
 * Create `schema`
 */

var schema = new mongoose.Schema({
  _organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  link: String,
  labels: Array,
  opts: mongoose.Schema.Types.Mixed,
  stats: mongoose.Schema.Types.Mixed
});

/**
 * On save generate a link
 */

schema.pre('save', function(next) {
  if (this.isNew || !this.link) this.link = uuid.v4().replace(/-/g, '');
  next();
});

/**
 * Send plan
 */

schema.methods.sendPlan = function(campaign_id, callback) {
  if (arguments.length === 1) {
    callback = campaign_id;
    campaign_id = null;
  }

  var commuter = this;
  var options = {
    commuterAddress: this.fullAddress(),
    orgAddress: this._organization.fullAddress(),
    subject: 'Your Personalized Commute Plan',
    template: 'plan',
    link: config.base_url + '/planner/' + this.link,
    to: {
      name: this.name,
      email: this._user.email
    }
  };

  mandrill.send(options, function(err, results) {
    console.log(err, results);
    if (err) {
      callback(err);
    } else {
      Email.create({
        _campaign: campaign_id,
        _commuter: commuter._id,
        _organization: commuter._organization._id,
        _user: commuter._user,
        metadata: options,
        result: results
      }, callback);
    }
  });
};

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-geocode'));
schema.plugin(require('../plugins/mongoose-querystring'));
schema.plugin(require('../plugins/mongoose-trackable'));

/**
 * Expose `Commuter`
 */

var Commuter = module.exports = mongoose.model('Commuter', schema);
