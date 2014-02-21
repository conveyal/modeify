/**
 * Dependencies
 */

var Page404 = require('404-page');
var analytics = require('analytics');
var Commuter = require('commuter');
var commuterForm = require('commuter-form');
var config = require('config');
var debug = require('debug')(config.name() + ':manager-router');
var Organization = require('organization');
var organizationForm = require('organization-form');
var p = require('page');
var session = require('session');

/**
 * Show alerts
 */

p('*', require('alerts'));

/**
 * If the user is logged in, redirect to orgs, else redirect to login
 */

p('/', session.checkIfLoggedIn, redirect('/organizations'));

/**
 * Public links
 */

p('/login', require('login-page'));
p('/logout', session.logout);
p('/forgot-password', require('forgot-password-page'));
p('/change-password/:key', require('change-password-page'));

/**
 * Admin only
 */

p('/managers', session.checkIfLoggedIn, session.checkIfAdmin, require(
  'managers-page'));

/**
 * Organizations
 */

p('/organizations*', session.checkIfLoggedIn);
p('/organizations', require('organizations-page'));
p('/organizations/new', organizationForm);
p('/organizations/:organization/*', Organization.load);
p('/organizations/:organization/show', Commuter.loadOrg, require(
  'organization-page'));
p('/organizations/:organization/edit', organizationForm);

/**
 * Commuters
 */

p('/organizations/:organization/commuters/new', commuterForm);
p('/organizations/:organization/commuters/:commuter/*', Commuter.load);
p('/organizations/:organization/commuters/:commuter/show', require(
  'commuter-page'));
p('/organizations/:organization/commuters/:commuter/edit', commuterForm);

/**
 * Render all
 */

p('*', render);

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

  // remove old view
  if (view) {
    view.off();
    if (view.el && view.el.remove) view.el.remove();
  }

  // if no view has been created or ther was an error, create an error page
  if (!ctx.view || ctx.error) ctx.view = new Page404(ctx.error || {});

  view = ctx.view;

  $main.innerHTML = '';
  $main.appendChild(view.el);
  view.emit('rendered', view);

  // track the page view
  analytics.page(ctx.view.category, ctx.view.title, ctx.view.properties);
}

/**
 * Redirect
 */

function redirect(to) {
  return function(ctx) {
    p('/organizations');
  };
}
