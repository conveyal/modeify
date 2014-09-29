var Page404 = require('404-page');
var analytics = require('analytics');
var log = require('log')('router-utils');
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
    log('redirecting from %s to %s', ctx.path, ctx.redirect);
    return page(ctx.redirect);
  }

  // if no redirect, render the view
  log('render %s', ctx.path);

  // remove old view
  if (view) {
    view.off();
    if (view.el && view.el.remove) view.el.remove();
  }

  // if no view has been created or ther was an error, create an error page
  if (!ctx.view || ctx.error) ctx.view = new Page404(ctx.error || {});

  // Store the new view
  view = ctx.view;

  $main.innerHTML = '';
  $main.appendChild(view.el);
  view.emit('rendered', view);

  // track the page view
  analytics.page(ctx.view.category, ctx.view.title);
};

/**
 * Expose `redirect`
 */

module.exports.redirect = function(to) {
  return function(ctx, next) {
    log('redirecting from %s to %s', ctx.path, to);
    page.show(to);
  };
};
