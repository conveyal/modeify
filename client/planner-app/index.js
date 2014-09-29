var onLoad = require('on-load');
var page = require('page');
var Plan = require('plan');
var utils = require('router-utils');
var session = require('session');

page('/', utils.redirect('/planner'));
page('/login', require('login-page'));
page('/forgot-password', require('forgot-password-page'));
page('/change-password/:key', require('change-password-page'));
page('/planner', session.commuterIsLoggedIn, Plan.load, require('planner-page'));
page('/planner/:link', session.loginWithLink);
page('*', utils.render);

onLoad(page);
