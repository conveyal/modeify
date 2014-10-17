var bcrypt = require('bcryptjs');
var config = require('../config');
var Email = require('../email/model');
var mandrill = require('../mandrill');
var mongoose = require('../mongo');
var uuid = require('node-uuid');

/**
 * Create `schema`
 */

var schema = new mongoose.Schema({
  change_password_key: String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  email_confirmation_key: String,
  email_confirmed: {
    type: Boolean,
    default: false
  },
  password: String,
  type: String
});

/**
 * Encrypt the password every time it is modified
 */

schema.pre('save', true, function(next, done) {
  next();
  if (this.isNew && !this.password)
    this.password = genkey();

  if (this.isModified('password')) {
    var self = this;
    bcrypt.hash(this.password, 10, function(err, hash) {
      if (err) {
        done(err);
      } else {
        self.password = hash;
        done();
      }
    });
  } else {
    done();
  }
});

/**
 * Send email confirmation on email change
 */

schema.pre('save', function(next) {
  next();
  if (this.isModified('email')) this.email_confirmation_key = genkey();
});

/**
 * Change password
 */

schema.statics.changePassword = function(key, password, callback) {
  var invalidKeyText =
    'Invalid change password key. Submit a change password request and use the generated link sent in the email.';
  if (!key || key.length === 0) return callback(invalidKeyText);

  this.findOne({
    change_password_key: key
  }, function(err, user) {
    if (err) {
      callback(err);
    } else if (!user) {
      callback(invalidKeyText);
    } else {
      user.change_password_key = genkey();
      user.email_confirmed = true;
      user.password = password;
      user.save(callback);
    }
  });
};

/**
 * Confirm Email
 */

schema.statics.confirmEmail = function(key, callback) {
  var invalidKeyText = 'Invalid email confirmation key.';
  if (!key || key.length === 0)
    return callback(invalidKeyText);

  this.findOne({
    email_confirmation_key: key
  }, function(err, user) {
    if (err) {
      callback(err);
    } else if (!user) {
      callback(invalidKeyText);
    } else {
      user.email_confirmed = true;
      user.save(callback);
    }
  });
};

/**
 * Compare
 */

schema.methods.comparePassword = function(password, callback) {
  bcrypt.compare(password, this.password, callback);
};

/**
 * Send user account setup email
 */

schema.methods.sendAccountSetup = function(callback) {
  this.change_password_key = uuid.v4().replace(/-/g, '');

  var base = config.base_url;
  if (this.type !== 'commuter') base += '/manager';

  var options = {
    application: config.application,
    domain: config.domain,
    emailName: config.email.name,
    subject: 'Welcome to ' + config.application,
    template: 'user-account-setup',
    to: {
      email: this.email
    },
    url: base + '/change-password/' + this.change_password_key
  };

  var self = this;
  this.save(function(err) {
    if (err) return callback(err);
    mandrill.send(options, function(err, result) {
      if (err) {
        callback(err);
      } else {
        Email.create({
          _user: self._id,
          metadata: options,
          result: result
        }, callback);
      }
    });
  });
};

/**
 * Reset a user's password
 */

schema.methods.sendChangePasswordRequest = function(callback) {
  this.change_password_key = uuid.v4().replace(/-/g, '');

  var base = config.base_url;
  if (this.type !== 'commuter') base += '/manager';

  var options = {
    change_password_url: base + '/change-password/' + this.change_password_key,
    subject: 'Change Password Requested',
    template: 'change-password-request',
    to: {
      email: this.email
    }
  };

  var self = this;
  this.save(function(err) {
    if (err) return callback(err);
    mandrill.send(options, function(err, result) {
      if (err) {
        callback(err);
      } else {
        Email.create({
          _user: self._id,
          metadata: options,
          result: result
        }, callback);
      }
    });
  });
};

/**
 * Send Email Confirmation
 */

schema.methods.sendEmailConfirmation = function(callback) {
  var base = config.base_url;
  if (this.type !== 'commuter') base += '/manager';

  var options = {
    confirm_email_url: base + '/confirm-email/' + this.email_confirmation_key,
    subject: 'Email Confirmation',
    template: 'confirm-email',
    to: {
      email: this.email
    }
  };

  var self = this;
  mandrill.send(options, function(err, result) {
    if (err) {
      callback(err);
    } else {
      Email.create({
        _user: self._id,
        metadata: options,
        result: result
      }, callback);
    }
  });
};

/**
 * Find or create
 *
 * @param {String} email
 * @param {Function} callback
 */

schema.statics.findOrCreate = function(data, callback) {
  var email = (data.email || '').toLowerCase();
  if (!email || email.length < 5) return callback(new Error('Invalid email.'));

  var self = this;
  this.findOne({
    email: email
  }, function(err, user) {
    if (err) {
      callback(err, user, false);
    } else if (user) {
      callback(null, user, true);
    } else {
      self.create({
        email: email,
        password: data.password,
        type: data.type
      }, function(err, user) {
        callback(err, user, false);
      });
    }
  });
};

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-trackable'));
schema.plugin(require('../plugins/mongoose-querystring'));

/**
 * Expose `User`
 */

var User = module.exports = mongoose.model('User', schema);

/**
 * Genkey
 */

function genkey() {
  return uuid.v4().replace(/-/g, '');
}
