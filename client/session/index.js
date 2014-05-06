var analytics = require('analytics');
var cookie = require('cookie');
var Commuter = require('commuter');
var config = require('config');
var debug = require('debug')(config.application() + ':session');
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
    cookie('commuter', null);
    cookie('user', null);

    debug('<-- logged out %s', res.text);
    if (next) next(err, res);
  });
};

/**
 * Login
 */

Session.prototype.login = function(data) {
  debug('--> login');

  var commuter = null;
  var type = null;
  var user = null;

  // is this a commuter object with a reference to a user?
  if (data._user) {
    debug('--- login as %s', data._user.email);

    // Create the commuter object
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

  debug('<-- login complete');
};

/**
 * Track user
 */

Session.on('change user', function(session, user, prev) {
  debug('--> identifying user');
  if (user && user._id) {
    analytics.identify(user._id(), user.toJSON());
    debug('<-- tracking %s', user.email());
  } else if (user !== prev) {
    var id = 'guest-' + uid(9);
    analytics.identify(id);
    debug('<-- tracking %s', id);
  }
});

/**
 * Expose `session`
 */

var session = window.session = module.exports = new Session();

/**
 * Log in with link middleware
 */

module.exports.loginWithLink = function(ctx, next) {
  debug('--> logging in with link %s', ctx.params.link);
  ctx.redirect = '/planner';
  request.get('/login/' + ctx.params.link, function(err, res) {
    if (res.ok && res.body) {
      session.login(res.body);
      debug('<-- successfully logged in with link');
      next();
    } else {
      debug('<-- failed to login with link: %s', err || res.text);
      next(err || new Error(res.text));
    }
  });
};

/**
 * Check if logged in
 */

module.exports.commuterIsLoggedIn = function(ctx, next) {
  debug('--> checking if commuter is logged in %s', ctx.path);
  request.get('/commuter-is-logged-in', function(err, res) {
    if (res.ok && res.body) {
      session.login(res.body);
      debug('<-- commuter is logged in');
      next();
    } else {
      debug('<-- commuter is not logged in: %s', err || res.text);
      next(err || res.text);
    }
  });
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
