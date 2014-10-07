var async = require('async');
var uuid = require('node-uuid');

var config = require('../config');
var Email = require('../email/model');
var geocode = require('../geocode');
var mandrill = require('../mandrill');
var mongoose = require('../mongo');
var User = require('../user/model');

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
  anonymous: Boolean,
  name: String,
  link: String,
  labels: Array,
  status: {
    type: String,
    default: 'sent'
  },
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
 * Generate
 */

schema.statics.generate = function(userData, commuterData, callback) {
  userData.type = 'commuter';

  async.waterfall([

    function(done) {
      User.findOrCreate(userData, done);
    },
    function(user, found, done) {
      commuterData._user = user._id;
      Commuter.findOrCreate(commuterData, done);
    },
    function(commuter, found, done) {
      commuter.populate('_user', done);
    },
    function(commuter, done) {
      commuter.sendPlan(function(err) {
        done(err, commuter);
      });
    }
  ], callback);
};

/**
 * Find or create a commuter
 */

schema.statics.findOrCreate = function(data, callback) {
  var self = this;
  this.findOne({
    _user: data._user
  }, function(err, commuter) {
    if (err) {
      callback(err, commuter, false);
    } else if (commuter) {
      callback(null, commuter, true);
    } else {
      self.create(data, function(err, commuter) {
        callback(err, commuter, false);
      });
    }
  });
};

/**
 * Add an email to an anonymous commuter
 */

schema.methods.addEmail = function(email, callback) {
  if (!this.anonymous)
    return callback('Commuter already has an email address.');

  var commuter = this;
  async.waterfall([
    function(done) {
      commuter._user.email = email;
      commuter._user.sendChangePasswordRequest(done);
    },
    function(email, done) {
      commuter.anonymous = false;
      commuter.save(done);
    }
  ], callback);
};

/**
 * Send plan
 */

schema.methods.sendPlan = function(campaign_id, callback) {
  // If no campaign id is passed, switch the args
  if (arguments.length === 1) {
    callback = campaign_id;
    campaign_id = null;
  }

  // Don't send plans to anonymous users
  if (this.anonymous) return callback();

  var commuter = this;
  var options = {
    application: config.application,
    name: this.name || 'Commuter',
    organization: config.organization.name,
    organization_url: config.organization.url,
    subject: 'Your Personalized Commute Plan',
    template: 'plan',
    link: config.base_url + '/planner/' + this.link,
    to: {
      name: this.name,
      email: this._user.email
    }
  };

  mandrill.send(options, function(err, results) {
    if (err) {
      callback(err);
    } else {
      Email.create({
        _campaign: campaign_id,
        _commuter: commuter._id,
        _organization: commuter._organization,
        _user: commuter._user,
        metadata: options,
        result: results
      }, callback);
    }
  });
};

/**
 * Update status
 */

schema.methods.updateStatus = function(callback) {
  var commuter = this;
  Email
    .findOne()
    .where('_commuter', this._id)
    .sort('-modified')
    .exec(function(err, email) {
      if (err) {
        callback(err);
      } else if (!email) {
        commuter.status = 'not invited';
        commuter.save(callback);
      } else {
        email.updateCommuter(commuter, callback);
      }
    });
};

/**
 * Reverse Geocode
 */

schema.methods.reverseGeocode = function(ll, callback) {
  var commuter = this;
  geocode.reverse(ll, function(err, address) {
    if (err) {
      callback(err);
    } else {
      for (var key in address) {
        commuter[key] = address[key];
      }
      commuter.save(callback);
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
