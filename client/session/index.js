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
    plan: null,
    user: null,
    isAdmin: false,
    isLoggedIn: false,
    isManager: false
  }))
  .attr('commuter')
  .attr('plan')
  .attr('user')
  .attr('isAdmin')
  .attr('isLoggedIn')
  .attr('isManager');

/**
 * Logout
 */

Session.prototype.logout = function(next) {
  debug('--> logging out');

  var plan = session.plan();
  if (plan) plan.clearStore();

  session.isAdmin(false);
  session.isLoggedIn(false);
  session.isManager(false);
  session.user(null);
  session.plan(null);
  session.commuter(null);

  request.get('/logout', function(err, res) {
    document.cookie = null;
    debug('<-- logged out %s', res.text);
    if (next) next(err, res);
  });
};

/**
 * Login
 */

Session.prototype.login = function(data) {
  var commuter = null;
  var type = null;
  var user = null;

  // is this a commuter object with a reference to a user?
  if (data._user) {
    commuter = new Commuter(data);
    user = new User(data._user);

    // is this user associated with an organization?
    if (data._organization && data._organization._id) {
      commuter._organization(new Organization(data._organization));
    }
    type = 'commuter';
  } else {
    user = new User(data);
    type = user.type();
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
  ctx.redirect = '/planner';
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
