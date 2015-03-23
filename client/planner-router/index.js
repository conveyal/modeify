var analytics = require('analytics');
var Commuter = require('commuter');
var CommuterProfile = require('commuter-profile');
var page = require('page');
var Plan = require('plan');
var Modal = require('modal');
var utils = require('router-utils');
var session = require('session');

page('*', function(ctx, next) {
  Modal.hide(); // clear all modals
  next();
})

page('/', utils.redirect('/planner'));

page('/login', require('commuter-login'));
page('/logout', session.logoutMiddleware, utils.redirect('/welcome'));
page('/forgot-password', require('forgot-password-page'));
page('/change-password/:key', require('change-password-page'));
page('/confirm-email/:key', Commuter.confirmEmail, utils.redirect('/login'));

page('/planner', session.commuterIsLoggedIn, Plan.load, require('planner-page'), require('announcements'));
page('/planner/:link', session.loginWithLink, utils.redirect('/planner'));

page('/profile', session.commuterIsLoggedIn, Plan.load, require('planner-page'), function(ctx, next) {
  ctx.modal = new CommuterProfile({
    commuter: session.commuter(),
    plan: session.plan()
  });
  next();
});

page('/style-guide', require('style-guide'));

page('/t/:code', loginAnonymously, function(ctx, next) {
  analytics.track('Referred User', {
    code: ctx.code
  });
  next();
}, utils.redirect('/planner'));

page('/welcome', loginAnonymously, utils.redirect('/planner'));

page('*', utils.render);

function loginAnonymously(ctx, next) {
  session.loginAnonymously(next);
}
