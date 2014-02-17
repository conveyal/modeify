/**
 * Dependencies
 */

var Nav = require('nav');
var onLoad = require('on-load');
var router = window.router = require('manager-router');
var session = require('session');

/**
 * Once the browser has "loaded"...ugh, can't believe we still need this.
 */

onLoad(function() {
  // display nav
  var nav = new Nav(session);
  document.body.insertBefore(nav.el, document.body.firstChild);

  // listen
  router.listen('/');
});
