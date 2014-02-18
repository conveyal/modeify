/**
 * Dependencies
 */

var Page404 = require('404-page');
var alerts = require('alerts');
var analytics = require('analytics');
var changePasswordPage = require('change-password-page');
var Commuter = require('commuter');
var commuterForm = require('commuter-form');
var commuterPage = require('commuter-page');
var config = require('config');
var dashboardPage = require('dashboard-page');
var debug = require('debug')(config.name() + ':manager-router');
var forgotPasswordPage = require('forgot-password-page');
var loginPage = require('login-page');
var Organization = require('organization');
var organizationForm = require('organization-form');
var organizationPage = require('organization-page');
var organizationsPage = require('organizations-page');
var Router = require('router');
var User = require('user');
var usersPage = require('users-page');

/**
 * Expose `router`
 */

var router = module.exports = new Router()
  .on('*',
    alerts)
  .on('/',
    User.isLoggedIn, redirect('/organizations'))
  .on('/login',
    loginPage, render)
  .on('/logout',
    User.logout)
  .on('/forgot-password',
    forgotPasswordPage, render, error)
  .on('/change-password/:key',
    changePasswordPage, render, error)
  .on('/commuters/:link/edit',
    Commuter.loadLink, commuterForm, render, error)
  .on('/users',
    User.isLoggedIn, User.isAdmin, usersPage, render, error)
  .on('/organizations',
    User.isLoggedIn, organizationsPage, render, error)
  .on('/organizations/new',
    User.isLoggedIn, organizationForm, render, error)
  .on('/organizations/:organization',
    User.isLoggedIn, Organization.load, Commuter.loadOrg, organizationPage, render, error)
  .on('/organizations/:organization/edit',
    User.isLoggedIn, Organization.load, organizationForm, render, error)
  .on('/organizations/:organization/commuters/new',
    User.isLoggedIn, commuterForm, render, error)
  .on('/organizations/:organization/commuters/:commuter',
    User.isLoggedIn, Organization.load, Commuter.load, commuterPage, render, error)
  .on('/organizations/:organization/commuters/:commuter/edit',
    User.isLoggedIn, Commuter.load, commuterForm, render, error)
  .on('*', notFound, render);

/**
 * Cache `main` & `view`
 */

var $main = document.getElementById('main');
var view = null;

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

    // track the page view
    analytics.page(ctx.view.category, ctx.view.title, ctx.view.properties);
  }
}

/**
 * Error
 */

function error(err, ctx, next) {
  debug('error %s at %s', err, ctx.path);
  ctx.view = new Page404({
    message: ''
  });
  render(ctx, next);
}

/**
 * Not found
 */

function notFound(ctx) {
  debug('%s not found', ctx.path);
  ctx.view = new Page404();
}

/**
 * Redirect
 */

function redirect(to) {
  return function(ctx) {
    router.go('/organizations');
  }
}
