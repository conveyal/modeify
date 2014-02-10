/**
 * Dependencies
 */

var alerts = require('alerts');
var changePasswordPage = require('change-password-page');
var Commuter = require('commuter');
var commuterForm = require('commuter-form');
var commuterPage = require('commuter-page');
var dashboardPage = require('dashboard-page');
var debug = require('debug')('router');
var forgotPasswordPage = require('forgot-password-page');
var loginPage = require('login-page');
var Organization = require('organization');
var organizationForm = require('organization-form');
var organizationPage = require('organization-page');
var organizationsPage = require('organizations-page');
var request = require('request');
var Router = require('router');
var session = require('session');
var User = require('user');
var usersPage = require('users-page');

/**
 * Root
 */

var root = '';

/**
 * Expose `router`
 */

var router = module.exports = new Router()
  .on(root + '*', setRoot, alerts)
  .on(root, isLoggedIn, function() {
    router.go(root + '/organizations');
  }) // if logged in redirect to dashboard
.on(root + '/login', loginPage, render)
  .on(root + '/logout', logout, render)
  .on(root + '/forgot-password', forgotPasswordPage, render)
  .on(root + '/change-password/:key', changePasswordPage, render)
  .on(root + '/commuters/:link/edit', Commuter.loadLink, commuterForm, render)
  .on(root + '/users', isLoggedIn, isAdmin, usersPage, render)
  .on(root + '/organizations', isLoggedIn, organizationsPage, render)
  .on(root + '/organizations/new', isLoggedIn, organizationForm, render)
  .on(root + '/organizations/:organization', isLoggedIn, Organization.load, Commuter.loadOrg,
    organizationPage, render)
  .on(root + '/organizations/:organization/edit', isLoggedIn, Organization.load,
    organizationForm, render)
  .on(root + '/organizations/:organization/commuters/new', isLoggedIn, commuterForm,
    render)
  .on(root + '/organizations/:organization/commuters/:commuter', isLoggedIn,
    Organization.load, Commuter.load, commuterPage, render)
  .on(root + '/organizations/:organization/commuters/:commuter/edit', isLoggedIn,
    Commuter.load, commuterForm, render);

/**
 * Cache `main` & `view`
 */

var $main = document.getElementById('main');
var view = null;

/**
 * Set root
 */

function setRoot(ctx, next) {
  ctx.root = root;
}

/**
 * Render
 */

function render(ctx, next) {
  debug('render %s %s', ctx.path, ctx.view);

  if (view) {
    view.off();
    if (view.el && view.el.remove) view.el.remove();
  }

  if (ctx.view) {
    view = ctx.view;
    view.on('go', function(path) {
      router.go(path);
    });

    $main.innerHTML = '';
    $main.appendChild(view.el);
    view.emit('rendered', view);
  }
}

/**
 * Redirect to `/login` if not logged in middleware
 */

function isLoggedIn(ctx, next) {
  debug('is logged in %s', ctx.path);

  if (User.instance) {
    session.isLoggedIn(true);
    session.isAdmin(User.instance.type() === 'administrator');
    ctx.user = User.instance;
    next();
  } else {
    request.get('/is-logged-in', function(err, res) {
      if (err || !res.ok) {
        session.isLoggedIn(false);
        session.isAdmin(false);
        router.go(root + '/login');
      } else {
        session.isLoggedIn(true);
        session.isAdmin(res.body.type === 'administrator');
        ctx.user = User.instance = new User(res.body);
        next();
      }
    });
  }
}

/**
 * Redirect to `/organizations` if not admin
 */

function isAdmin(ctx, next) {
  debug('is admin %s', ctx.path);
  if (!session.isAdmin()) {
    router.go(root + '/organizations');
  } else {
    next();
  }
}

/**
 * Logout middleware
 */

function logout(ctx) {
  debug('logout %s', ctx.path);

  session.isLoggedIn(false);
  session.isAdmin(false);
  User.instance = null;

  request.get('/logout', function(err, res) {
    document.cookie = null;
    router.go(root + '/login');
  });
}
