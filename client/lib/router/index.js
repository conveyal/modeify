/**
 * Dependencies
 */

var alerts = require('alerts');
var changePasswordPage = require('change-password-page');
var dashboardPage = require('dashboard-page');
var debug = require('debug')('router');
var forgotPasswordPage = require('forgot-password-page');
var loginPage = require('login-page');
var request = require('request');
var Router = require('router');
var session = require('session');
var User = require('user');

/**
 * Expose `router`
 */

var router = module.exports = new Router()
  .on('*', alerts)
  .on('/', isLoggedIn, function() { router.go('/dashboard'); }) // if logged in redirect to dashboard
  .on('/login', loginPage, render)
  .on('/logout', logout, render)
  .on('/forgot-password', forgotPasswordPage, render)
  .on('/change-password/:key', changePasswordPage, render)
  .on('/dashboard', isLoggedIn, dashboardPage, render);
/*.on('/organizations', isLoggedIn, organizationsPage)
  .on('/organizations/new', isLoggedIn, createOrganizationPage)
  .on('/organizations/:organization', isLoggedIn, organizationPage)
  .on('/organizations/:organization/edit', isLoggedIn, editOrganizationPage)
  .on('/organizations/:organization/commuters', isLoggedIn, commutersPage)
  .on('/organizations/:organization/commuters/new', isLoggedIn, createCommuterPage)
  .on('/organizations/:organization/commuters/:commuter', isLoggedIn, commuterPage)
  .on('/organizations/:organization/commuters/:commuter/edit', isLoggedIn, editCommuterPage);*/

/**
 * Cache `main` & `view`
 */

var $main = document.getElementById('main');
var view = null;

/**
 * Render
 */

function render(ctx) {
  debug('render %s %s', ctx.path, ctx.view);

  if (view) {
    view.off();
    if (view.el) view.el.remove();
  }

  if (ctx.view) {
    view = ctx.view;
    view.on('go', function(path) {
      router.go(path);
    });

    $main.appendChild(view.el);
  }
}

/**
 * Redirect to `/login` if not logged in middleware
 */

function isLoggedIn(ctx, next) {
  debug('is logged in %s', ctx.path);

  if (User.instance) {
    session.isLoggedIn(true);
    session.isAdmin(User.instance.type === 'administrator');
    ctx.user = User.instance;
    next();
  } else {
    request.get('/is-logged-in', function(err, res) {
      if (err || !res.ok) {
        session.isLoggedIn(false);
        session.isAdmin(false);
        router.go('/login');
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
 * Logout middleware
 */

function logout(ctx) {
  debug('logout %s', ctx.path);

  session.isLoggedIn(false);
  session.isAdmin(false);
  User.instance = null;

  request.get('/logout', function(err, res) {
    document.cookie = null;
    router.go('/login');
  });
}
