/**
 * Dependencies
 */

var analytics = require('analytics');
var Page404 = require('404-page');
var config = require('config');
var debug = require('debug')(config.name() + ':router-utils');
var page = require('page');

/**
 * Cache `main` & `view`
 */

var $main = document.getElementById('main');
var view = null;

/**
 * Expose `render`
 */

module.exports.render = function(ctx, next) {
  if (ctx.redirect) {
    debug('redirecting from %s to %s', ctx.path, ctx.redirect);
    return page(ctx.redirect);
  }

  // if no redirect, render the view
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
};

/**
 * Expose `redirect`
 */

module.exports.redirect = function(to) {
  return function(ctx, next) {
    debug('redirecting from %s to %s', ctx.path, to);
    page.show(to);
  };
};
