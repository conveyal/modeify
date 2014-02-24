/**
 * Dependencies
 */

var analytics = require('analytics');
var Commuter = require('commuter');
var config = require('config');
var debug = require('debug')(config.name() + ':session');
var defaults = require('model-defaults');
var model = require('model');
var page = require('page');
var request = require('request');
var User = require('user');

/**
 * Session
 */

var Session = model('Session')
  .use(defaults({
    commuter: false,
    user: false,
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
 * Expose `session`
 */

var session = window.session = module.exports = new Session();

/**
 * Track user
 */

session.on('change user', function(user) {
  if (user) analytics.identify(user._id(), user.toJSON());
  else analytics.identify(null);
});

/**
 * Login
 */

module.exports.login = function(data, callback) {
  request.post('/login', data, function(err, res) {
    if (res.ok) {
      var user = new User(res.body);

      session.user(user);
      session.isAdmin(user.type() === 'administrator');
      session.isManager(user.type() !== 'commuter');
      session.isLoggedIn(true);

      callback(null, user);
    } else {
      callback(err);
    }
  });
};

/**
 * Log in with link middleware
 */

module.exports.loginWithLink = function(ctx, next) {
  request.get('/login/' + ctx.params.link, function(err, res) {
    if (res.ok) {
      var commuter = new Commuter(res.body);
      var user = new User(res.body._user);

      session.commuter(commuter);
      session.user(user);
      session.isAdmin(user().type() === 'administrator');
      session.isManager(user().type() !== 'commuter');
      session.isLoggedIn(true);

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
    session.isLoggedIn(true);
    session.isAdmin(session.user().type() === 'administrator');
    session.isManager(session.user().type() !== 'commuter');
    next();
  } else {
    request.get('/commuter-is-logged-in', function(err, res) {
      if (err || !res.ok) {
        session.isLoggedIn(false);
        session.isAdmin(false);
        session.isManager(false);
        session.user(null);
        session.commuter(null);
        next();
      } else {
        var commuter = new Commuter(res.body);
        var user = new User(res.body._user);

        session.commuter(commuter);
        session.user(user);
        session.isAdmin(user.type() === 'administrator');
        session.isManager(user.type() !== 'commuter');
        session.isLoggedIn(true);

        next();
      }
    });
  }
};

/**
 * Log out
 */

module.exports.logout = function(ctx) {
  debug('logout %s', ctx.path);

  session.isAdmin(false);
  session.isLoggedIn(false);
  session.isManager(false);
  session.user(null);

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
    session.isLoggedIn(true);
    session.isAdmin(session.user().type() === 'administrator');
    session.isManager(session.user().type() !== 'commuter');
    next();
  } else {
    request.get('/is-logged-in', function(err, res) {
      if (err || !res.ok) {
        session.isLoggedIn(false);
        session.isAdmin(false);
        session.isManager(false);
        session.user(null);
        page('/manager/login');
      } else {
        session.user(new User(res.body));
        session.isLoggedIn(true);
        session.isAdmin(res.body.type === 'administrator');
        session.isManager(res.body.type !== 'commuter');
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
