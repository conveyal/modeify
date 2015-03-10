var analytics = require('analytics');
var Commuter = require('commuter');
var historyPolyfill = require('html5-history-api');
var onLoad = require('on-load');
var page = require('page');
var Plan = require('plan');
var utils = require('router-utils');
var session = require('session');

page('/', utils.redirect('/planner'));

page('/login', require('commuter-login'));
page('/forgot-password', require('forgot-password-page'));
page('/change-password/:key', require('change-password-page'));
page('/confirm-email/:key', Commuter.confirmEmail, utils.redirect('/login'));

page('/planner', session.commuterIsLoggedIn, Plan.load, require('planner-page'));
page('/planner/:link', session.loginWithLink, utils.redirect('/planner'));

page('/style-guide', require('style-guide'));

page('/t/:code', function(ctx, next) {
  session.loginAnonymously(function(err) {
    analytics.track('Referred User', {
      code: ctx.code
    });
    next(err);
  });
}, utils.redirect('/planner'));

page('/welcome', function(ctx, next) {
  session.loginAnonymously(next);
}, utils.redirect('/planner'));

page('*', utils.render);

onLoad(page);
