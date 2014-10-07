var analytics = require('analytics');
var cookie = require('cookie');
var Commuter = require('commuter');
var log = require('log')('session');
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
  log('--> logging out');

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

    document.cookie = null;

    log('<-- logged out %s', res.text);
    if (next) next(err, res);
  });
};

/**
 * Login
 */

Session.prototype.login = function(data) {
  log('--> login');

  var commuter = null;
  var type = null;
  var user = null;

  // is this a commuter object with a reference to a user?
  if (data._user) {
    log('--- login as %s', data._user.email);

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

  log('<-- login complete');
};

/**
 * Track user
 */

Session.on('change user', function(session, user, prev) {
  log('--> identifying user');
  if (user && user._id) {
    analytics.identify(user._id(), user.toJSON());
    log('<-- tracking %s', user.email());
  } else if (user !== prev) {
    var id = 'guest-' + uid(9);
    analytics.identify(id);
    log('<-- tracking %s', id);
  }
});

/**
 * Expose `session`
 */

var session = window.session = module.exports = new Session();

/**
 * Log in with link middleware
 */

session.loginWithLink = function(ctx, next) {
  log('--> logging in with link %s', ctx.params.link);
  ctx.redirect = '/planner';
  request.get('/login/' + ctx.params.link, function(err, res) {
    if (res.ok && res.body) {
      session.login(res.body);
      log('<-- successfully logged in with link');
      next();
    } else {
      log.warn('<-- failed to login with link: %e', err);
      next(err || new Error(res.text));
    }
  });
};

/**
 * Log in anonymously
 */

session.loginAnonymously = function(next) {
  log('--> logging in anonymously');
  request.get('/login-anonymously', function(err, res) {
    if (res.ok && res.body) {
      session.login(res.body);
      log('<-- logged in anonymously');
      next();
    } else {
      log.warn('<-- failed to log in anonymously: %e', err || res.error);
      next(err || res.error || res.text);
    }
  });
};

/**
 * Check if logged in
 */

session.commuterIsLoggedIn = function(ctx, next) {
  log('--> checking if commuter is logged in %s', ctx.path);
  request.get('/commuter-is-logged-in', function(err, res) {
    if (res.ok && res.body) {
      session.login(res.body);
      log('<-- commuter is logged in');
      next();
    } else {
      log('<-- commuter is not logged in: %e', err || res.error);
      session.loginAnonymously(next);
    }
  });
};

/**
 * Log out
 */

session.logoutMiddleware = function(ctx) {
  log('logout %s', ctx.path);

  session.logout(function() {
    page('/manager/login');
  });
};

/**
 * Redirect to `/login` if not logged in middleware
 */

session.checkIfLoggedIn = function(ctx, next) {
  log('check if user is logged in %s', ctx.path);

  if (session.isLoggedIn() && session.isManager()) {
    next();
  } else {
    request.get('/is-logged-in', function(err, res) {
      if (err || !res.ok) {
        page('/manager/login');
      } else {
        session.login(res.body);
        if (!session.isManager()) window.location =  '/';
        else next();
      }
    });
  }
};

/**
 * Check if admin
 */

session.checkIfAdmin = function(ctx, next) {
  log('is admin %s', ctx.path);
  if (session.user().type() !== 'administrator') {
    page('/manager/organizations');
  } else {
    next();
  }
};

/**
 * Check if manager
 */

session.checkIfManager = function(ctx, next) {
  log('is manager %s', ctx.path);
  if (session.user().type() === 'commuter') {
    page('/manager/login');
  } else {
    next();
  }
};
