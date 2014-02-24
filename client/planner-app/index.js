/**
 * Dependencies
 */

var onLoad = require('on-load');
var page = require('page');
var Plan = require('plan');
var Nav = require('planner-nav');
var utils = require('router-utils');
var session = require('session');

/**
 * Set up routes
 */

page('/', utils.redirect('/planner'));
page('/planner', session.commuterIsLoggedIn, Plan.load, /* Welcome.load, */
  require('planner-page'));
page('/planner/:link', session.loginWithLink, utils.redirect('/planner'));

/**
 * Render all
 */

page('*', utils.render);

/**
 * Once the browser has "loaded"...ugh, can't believe we still need this.
 */

onLoad(function() {
  // show nav ?
  var nav = new Nav(session);
  document.body.insertBefore(nav.el, document.body.firstChild);

  // listen
  page();
});
