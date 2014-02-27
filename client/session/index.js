/**
 * Dependencies
 */

var analytics = require('analytics');
var Commuter = require('commuter');
var config = require('config');
var debug = require('debug')(config.name() + ':session');
var defaults = require('model-defaults');
var model = require('model');
var Organization = require('organization');
var page = require('page');
var request = require('request');
var uid = require('uid');
var User = require('user');

/**
 * Session
 */

var Session = model('Session')
  .use(defaults({
    commuter: null,
    user: null,
    isAdmin: false,
    isLoggedIn: false,
    isManager: false
  }))
  .attr('commuter')
  .attr('user')
  .attr('isAdmin')
  .attr('isLoggedIn')
  .attr('isManager');

/**
 * Logout
 */

Session.prototype.logout = function() {
  session.isAdmin(false);
  session.isLoggedIn(false);
  session.isManager(false);
  session.user(null);
  session.commuter(null);
};

/**
 * Login
 */

Session.prototype.login = function(data) {
  var commuter = null;
  var type = null;
  var user = null;

  // is the user a commuter?
  if (data._user) {
    commuter = new Commuter(data);
    user = new User(data._user);
    if (data._organization && data._organization._id) {
      commuter._organization(new Organization(data._organization));
    }
  } else {
    user = new User(data);
  }

  session.commuter(commuter);
  session.user(user);
  session.isAdmin(type === 'administrator');
  session.isManager(type !== 'commuter');
  session.isLoggedIn(true);
};

/**
 * Expose `session`
 */

var session = window.session = module.exports = new Session();

/**
 * Track user
 */

session.on('change user', function(user, prev) {
  if (user) analytics.identify(user._id(), user.toJSON());
  else if (user !== prev) analytics.identify('guest-' + uid());
});

/**
 * Log in with link middleware
 */

module.exports.loginWithLink = function(ctx, next) {
  ctx.redirect = '/';
  request.get('/login/' + ctx.params.link, function(err, res) {
    if (res.ok) {
      session.login(res.body);
      next();
    } else {
      next(err || new Error(res.text));
    }
  });
};

/**
 * Check if logged in
 */

module.exports.commuterIsLoggedIn = function(ctx, next) {
  debug('check if commuter is logged in %s', ctx.path);

  if (session.commuter()) {
    next();
  } else {
    request.get('/commuter-is-logged-in', function(err, res) {
      if (err || !res.ok) {
        session.logout();
        next();
      } else {
        session.login(res.body);
        next();
      }
    });
  }
};

/**
 * Log out
 */

module.exports.logoutMiddleware = function(ctx) {
  debug('logout %s', ctx.path);

  session.logout();
  request.get('/logout', function(err, res) {
    document.cookie = null;
    page('/manager/login');
  });
};

/**
 * Redirect to `/login` if not logged in middleware
 */

module.exports.checkIfLoggedIn = function(ctx, next) {
  debug('check if user is logged in %s', ctx.path);

  if (session.user()) {
    next();
  } else {
    request.get('/is-logged-in', function(err, res) {
      if (err || !res.ok) {
        session.logout();
        page('/manager/login');
      } else {
        session.login(res.body);
        next();
      }
    });
  }
};

/**
 * Check if admin
 */

module.exports.checkIfAdmin = function(ctx, next) {
  debug('is admin %s', ctx.path);
  if (session.user().type() !== 'administrator') {
    page('/manager/organizations');
  } else {
    next();
  }
};

/**
 * Check if manager
 */

module.exports.checkIfManager = function(ctx, next) {
  debug('is manager %s', ctx.path);
  if (session.user().type() === 'commuter') {
    page('/manager/login');
  } else {
    next();
  }
};
