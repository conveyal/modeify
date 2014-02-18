/**
 * Dependencies
 */

var analytics = require('analytics');
var config = require('config');
var debug = require('debug')(config.name() + ':user');
var go = require('go');
var model = require('model');
var request = require('request');
var session = require('session');

/**
 * Expose `User`
 */

var User = module.exports = model('User')
  .route(config.api_url() + '/users')
  .attr('_id')
  .attr('email')
  .attr('type')
  .attr('created')
  .attr('modified');

/**
 * Identify on creation
 */

User.on('construct', function(user, attrs) {
  analytics.identify(user._id(), user.toJSON());
});

/**
 * Cache `instance`
 */

var instance = module.exports.instance = null;

/**
 * Login
 */

User.login = function(data, callback) {
  request.post('/login', data, function(err, res) {
    if (res.ok) {
      instance = new User(res.body);
      callback(null, instance);
    } else {
      callback(err);
    }
  });
};

/**
 * Log out
 */

User.logout = function() {
  debug('logout %s', ctx.path);

  session.isLoggedIn(false);
  session.isAdmin(false);
  instance = null;

  request.get('/logout', function(err, res) {
    document.cookie = null;
    go('/login');
  });
}

/**
 * Redirect to `/login` if not logged in middleware
 */

User.isLoggedIn = function(ctx, next) {
  debug('check if user is logged in %s', ctx.path);

  if (User.instance) {
    session.isLoggedIn(true);
    session.isAdmin(instance.type() === 'administrator');
    ctx.user = instance;
    next();
  } else {
    request.get('/is-logged-in', function(err, res) {
      if (err || !res.ok) {
        session.isLoggedIn(false);
        session.isAdmin(false);
        go('/login');
      } else {
        session.isLoggedIn(true);
        session.isAdmin(res.body.type === 'administrator');
        ctx.user = instance = new User(res.body);
        next();
      }
    });
  }
};

/**
 * Check if admin
 */

User.isAdmin = function(ctx, next) {
  debug('is admin %s', ctx.path);
  if (!session.isAdmin()) {
    go('/organizations');
  } else {
    next();
  }
};
