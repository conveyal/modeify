var Commuter = require('commuter');
var commuterForm = require('commuter-form');
var log = require('log')('manager-router');
var Organization = require('organization');
var organizationForm = require('organization-form');
var p = require('page');
var session = require('session');
var utils = require('router-utils');

// Setup & show alerts

p('*', function(ctx, next) {
  ctx.manager = true;
  next();
}, require('alerts'));

// If the user is logged in, redirect to orgs, else redirect to login

p('/', session.checkIfLoggedIn, utils.redirect('/organizations'));

// Public links

p('/login', require('login-page'));
p('/logout', session.logoutMiddleware);
p('/forgot-password', require('forgot-password-page'));
p('/change-password/:key', require('change-password-page'));

// Admin only

p('/managers', session.checkIfLoggedIn, session.checkIfAdmin, require(
  'managers-page'));

// Organizations

p('/organizations/(.*)', session.checkIfLoggedIn);
p('/organizations/', require('organizations-page'));
p('/organizations/new', organizationForm);
p('/organizations/:organization/(.*)', Organization.load);
p('/organizations/:organization/show', Commuter.loadOrg, require(
  'organization-page'));
p('/organizations/:organization/edit', organizationForm);

// Commuters

p('/organizations/:organization/commuters/new', commuterForm);
p('/organizations/:organization/commuters/:commuter/(.*)', Commuter.load);
p('/organizations/:organization/commuters/:commuter/show', require(
  'commuter-page'));
p('/organizations/:organization/commuters/:commuter/edit', commuterForm);

// Feedback

p('/feedback', session.checkIfLoggedIn, require('feedback-table-page'));

// Render all

p('*', utils.render);
